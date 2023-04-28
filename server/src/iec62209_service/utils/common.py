from enum import Enum
from math import fabs
from os import remove
from tempfile import NamedTemporaryFile

from iec62209.plot import (
    plot_sample_deviations,
    plot_sample_distribution,
    plot_sample_marginals,
)
from iec62209.work import (
    Model,
    Sample,
    Work,
    add_zvar,
    load_measured_sample,
    save_sample,
)
from matplotlib import pyplot as plt
from pydantic import BaseModel

plt.rc("font", size=14)


class SarFiltering(str, Enum):
    SAR1G = "SAR1G"
    SAR10G = "SAR10G"


class Goodfit:
    def __init__(self, accept: bool = False, gfres: tuple = (False, 0)):
        self.accept: bool = accept
        self.gfres: tuple = gfres


### pydantic MODELS


class SampleConfig(BaseModel):
    fRangeMin: int = 300
    fRangeMax: int = 6000
    measAreaX: int = 0
    measAreaY: int = 0
    sampleSize: int = 0


class ModelMetadata(BaseModel):
    filename: str = ""
    systemName: str
    manufacturer: str = ""
    phantomType: str
    hardwareVersion: str
    softwareVersion: str
    acceptanceCriteria: str
    normalizedRMSError: str


### Helper classes


def fig2png(fig):
    import io

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    plt.close(fig)
    return buf


class DataSetInterface:
    def __init__(self):
        # headings = ['no.', 'antenna', 'frequency', 'power', 'modulation', 'par', 'bandwidth', 'distance', 'angle', 'x', 'y', 'sar_1g', 'sar_10g', 'u_1g', 'u_10g']
        self.sample: Sample = None
        self.headings = []
        self.rows = []
        self.config = SampleConfig()

    def clear(self):
        self.sample = None
        self.headings = []
        self.rows = []
        self.config = SampleConfig()

    def __dict__(self) -> dict:
        return {"headings": self.headings, "rows": self.rows}

    def to_dict(self) -> dict:
        return self.__dict__()

    def add_columns(self, cols: list[str]):
        if self.sample is None:
            raise Exception("Sample data not present")
        for col in cols:
            self.headings.append(col)
            self.sample.data[col] = 0
            for row in self.rows:
                row.append(0)

    def generate(self, config: SampleConfig):
        self.config = SampleConfig()
        w = Work()
        w.generate_sample(
            size=config.sampleSize,
            xmax=0.5 * config.measAreaX,
            ymax=0.5 * config.measAreaY,
            show=False,
            save_to=None,
        )
        self.sample = w.data["sample"]
        headings = w.data["sample"].data.columns.tolist()
        values = w.data["sample"].data.values.tolist()
        if not isinstance(headings, list) or not isinstance(values, list):
            raise Exception("Invalid sample generated")
        need_to_add_ids = False
        if "no." not in headings:
            headings = ["no."] + headings
            need_to_add_ids = True
        self.headings = headings
        self.rows = []
        idx: int = 1
        for row in values:
            if need_to_add_ids:
                row = [idx] + row
                idx += 1
            self.rows.append(row)
        self.config = config

    @classmethod
    def from_dataframe(cls, sample: Sample):
        dataset = cls()
        dataset.sample = sample

        # we convert to json here to avoid issues when jsonifying numpy data types
        data = dict(sample.to_json()["data"])
        for key in data:
            dataset.headings.append(key)
        if len(dataset.headings) == 0:
            raise Exception("Empty or ill-formed data")

        nrows = len(data[dataset.headings[0]])
        for n in range(nrows):
            row = []
            for heading in dataset.headings:
                row.append(data[heading][n])
            dataset.rows.append(row)

        dataset.config.measAreaX = 2 * sample.mdata["xmax"]
        dataset.config.measAreaY = 2 * sample.mdata["ymax"]
        dataset.config.sampleSize = nrows

        return dataset

    def plot_marginals(self):
        if self.sample is None:
            raise Exception("Sample not loaded")
        fig = plot_sample_marginals(self.sample)
        return fig2png(fig)

    def plot_deviations(self):
        if self.sample is None:
            raise Exception("Sample not loaded")
        fig = plot_sample_deviations(self.sample)
        return fig2png(fig)

    def plot_distribution(self):
        if self.sample is None:
            raise Exception("Sample not loaded")
        fig = plot_sample_distribution(self.sample)
        return fig2png(fig)

    def export_to_csv(self, filename):
        save_sample(self.sample, filename)


### Interfaces to publication-IEC62209


class SampleInterface:
    testSet = DataSetInterface()
    trainingSet = DataSetInterface()
    criticalSet = DataSetInterface()


class ModelInterface:
    work: Work = Work()
    residuals = []
    goodfit = Goodfit()

    @classmethod
    def clear(cls):
        cls.work.clear()
        cls.work.clear_model()
        cls.work.clear_sample()
        cls.residuals = []
        cls.goodfit = Goodfit()

    @classmethod
    def has_init_sample(cls) -> bool:
        return cls.work.data.get("initsample") is not None

    @classmethod
    def has_test_sample(cls) -> bool:
        return cls.work.data.get("testsample") is not None

    @classmethod
    def has_model(cls) -> bool:
        try:
            return cls.work.data.get("model") is not None
        except:
            return False

    @classmethod
    def raise_if_no_model(cls) -> None:
        if not cls.has_model():
            raise Exception("No model loaded")

    @classmethod
    def model_covers_sample(cls, ds: DataSetInterface) -> bool:
        cls.raise_if_no_model()
        return cls.work.data.get("model").contains(ds.sample)

    @classmethod
    def load_init_sample(cls, filename) -> dict:
        tmp = NamedTemporaryFile(delete=False)
        try:
            measured = load_measured_sample(filename)
            add_zvar(measured, "10g")
            measured.to_csv(tmp.name)
            sample = cls.work.load_init_sample(tmp.name, "sard10g")
            SampleInterface.trainingSet = DataSetInterface.from_dataframe(sample)
        except TypeError:
            raise Exception(
                "Please make sure that numbers are not formatted (e.g. to percentages)"
            )
        finally:
            remove(tmp.name)

        if not cls.has_init_sample():
            raise Exception("Failed to load sample")
        if sample.data.values.size == 0:
            raise Exception(f"Failed to load data, or {filename} is empty")
        return {
            "headings": sample.data.columns.tolist(),
            "rows": sample.data.values.tolist(),
        }

    @classmethod
    def load_test_sample(cls, filename) -> dict:
        tmp = NamedTemporaryFile(delete=False)
        try:
            measured = load_measured_sample(filename)
            add_zvar(measured, "10g")
            measured.to_csv(tmp.name)
            sample = cls.work.load_test_sample(tmp.name, "sard10g")
            SampleInterface.testSet = DataSetInterface.from_dataframe(sample)
        except TypeError:
            raise Exception(
                "Please make sure that numbers are not formatted (e.g. to percentages)"
            )
        finally:
            remove(tmp.name)

        if not cls.has_test_sample():
            raise Exception("Failed to load sample")
        if sample.data.values.size == 0:
            raise Exception(f"Failed to load data, or {filename} is empty")
        return {
            "headings": sample.data.columns.tolist(),
            "rows": sample.data.values.tolist(),
        }

    @classmethod
    def load_critical_sample(cls, filename) -> dict:
        cls.raise_if_no_model()
        tmp = NamedTemporaryFile(delete=False)
        try:
            measured = load_measured_sample(filename)
            add_zvar(measured, "10g")
            measured.to_csv(tmp.name)
            # cls.work.init_critsample()
            xvar = [
                "frequency",
                "power",
                "par",
                "bandwidth",
                "distance",
                "angle",
                "x",
                "y",
            ]
            cls.work.data["critsample"] = Sample.from_csv(
                tmp.name, xvar=xvar, zvar=["sard10g"]
            )
            SampleInterface.criticalSet = DataSetInterface.from_dataframe(
                cls.work.data["critsample"]
            )
        finally:
            remove(tmp.name)
        return SampleInterface.criticalSet.to_dict()

    @classmethod
    def set_metadata(cls, md: ModelMetadata):
        cls.raise_if_no_model()
        cls.work.data.get("model").metadata = dict(md)

    @classmethod
    def get_metadata(cls) -> ModelMetadata:
        cls.raise_if_no_model()
        return ModelMetadata.parse_obj(cls.work.model_metadata())

    @classmethod
    def dump_model_to_json(cls):
        model: Model = cls.work.data.get("model")
        if model is None:
            raise Exception("no model has been created")
        return model.to_json()

    @classmethod
    def load_model_from_json(cls, json):
        cls.clear()
        cls.work.load_model(json)
        SampleInterface.trainingSet = DataSetInterface.from_dataframe(
            cls.work.data.get("model").sample
        )

    @classmethod
    def make_model(cls):
        cls.work.make_model(show=False)

    @classmethod
    def plot_model(cls):
        cls.raise_if_no_model()
        fig = cls.work.plot_model()
        return fig2png(fig)

    @staticmethod
    def acceptance_criteria(data: DataSetInterface) -> bool:
        dataok = True
        if data is not None:
            mpecol = data.headings.index("mpe10g")
            sardcol = data.headings.index("sard10g")
            for row in data.rows:
                if fabs(row[sardcol]) > row[mpecol]:
                    dataok = False
                    break
        return dataok

    @classmethod
    def goodfit_test(cls) -> Goodfit:
        if not cls.has_model():
            raise Exception("No model loaded")

        initsample = SampleInterface.trainingSet
        dataok = ModelInterface.acceptance_criteria(initsample)

        gfres: tuple = cls.work.goodfit_test()

        cls.goodfit = Goodfit(dataok, gfres)
        return cls.goodfit

    @classmethod
    def goodfit_plot(cls):
        if not cls.has_model():
            raise Exception("No model loaded")
        fig = cls.work.goodfit_plot()
        return fig2png(fig)

    @classmethod
    def compute_residuals(cls) -> bool:
        cls.raise_if_no_model()
        cls.residuals = cls.work.compute_resid()
        return True

    @classmethod
    def residuals_test(cls) -> tuple:
        cls.raise_if_no_model()
        if len(cls.residuals) == 0:
            raise Exception("Residuals have not been calculated")
        swres, qqres = cls.work.resid_test(cls.residuals)
        return (swres, qqres)

    @classmethod
    def plot_residuals(cls):
        if len(cls.residuals) == 0:
            raise Exception("Residuals have not been calculated")
        fig = cls.work.resid_plot(cls.residuals)
        return fig2png(fig)

    @classmethod
    def explore_space(cls, iters: int = 3) -> dict:
        cls.raise_if_no_model()
        cls.work.explore(iters, show=False, save_to=None)
        critsample = cls.work.data["critsample"]
        critsample.data = critsample.data[critsample.data["pass"] > 0.01]
        critsample.data["pass"] = critsample.data["pass"].apply(lambda x: x * 100.0)
        critsample.data = critsample.data.drop("sard10g", axis=1)
        critsample.data = critsample.data.drop("err", axis=1)
        SampleInterface.criticalSet = DataSetInterface.from_dataframe(critsample)
        SampleInterface.criticalSet.add_columns(["sar10g", "u10g"])
        return SampleInterface.criticalSet.to_dict()
