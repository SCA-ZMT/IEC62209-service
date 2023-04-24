from enum import Enum

from iec62209.work import Work
from pydantic import BaseModel

### pydantic MODELS


class SarFiltering(str, Enum):
    SAR1G = "SAR1G"
    SAR10G = "SAR10G"
    SARBOTH = "SARBOTH"


class SampleConfig(BaseModel):
    fRangeMin: int
    fRangeMax: int
    fAreaX: int
    fAreaY: int
    sampleSize: int


class ModelMetadata(BaseModel):
    filename: str = ""
    systemName: str
    phantomType: str
    hardwareVersion: str
    softwareVersion: str
    acceptanceCriteria: str
    normalizedRMSError: str


### Helper classes


class TrainingSetGeneration:
    def __init__(self):
        # headings = ['no.', 'antenna', 'frequency', 'power', 'modulation', 'par', 'bandwidth', 'distance', 'angle', 'x', 'y', 'sar_1g', 'sar_10g', 'u_1g', 'u_10g']
        self.headings = []
        self.rows = []

    def clear(self):
        self.headings = []
        self.rows = []

    def to_dict(self) -> dict:
        return {"headings": self.headings, "rows": self.rows}


### Interfaces to publication-IEC62209


class SampleInterface:
    trainingSet = TrainingSetGeneration()

    @classmethod
    def generate_sample(cls, config: SampleConfig) -> TrainingSetGeneration:
        cls.trainingSet.clear()

        w = Work()
        w.generate_sample(config.sampleSize, show=False, save_to=None)
        headings = w.data["sample"].data.columns.tolist()
        values = w.data["sample"].data.values.tolist()
        if not isinstance(headings, list) or not isinstance(values, list):
            raise Exception("Invalid sample generated")
        need_to_add_ids = False
        if "no." not in headings:
            headings = ["no."] + headings
            need_to_add_ids = True
        cls.trainingSet.headings = headings
        idx: int = 1
        for row in values:
            if need_to_add_ids:
                row = [idx] + row
                idx += 1
            cls.trainingSet.rows.append(row)
        return cls.trainingSet.to_dict()


class ModelInterface:
    work: Work = Work()

    @staticmethod
    def fig2png(fig):
        import io

        buf = io.BytesIO()
        fig.savefig(buf, format="png")
        buf.seek(0)
        return buf

    @classmethod
    def clear(cls):
        cls.work.clear()
        cls.work.clear_model()
        cls.work.clear_sample()

    @classmethod
    def has_sample(cls) -> bool:
        return cls.work.data.get("initsample") is not None

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
    def load_init_sample(cls, filename) -> dict:
        sample = cls.work.load_init_sample(filename, "sard10g")
        if sample.size() == 0:
            raise Exception(f"Failed to load data, or {filename} is empty")
        return {
            "headings": sample.data.columns.tolist(),
            "rows": sample.data.values.tolist(),
        }

    @classmethod
    def get_metadata(cls) -> ModelMetadata:
        cls.raise_if_no_model()
        model = cls.work.data.get("model")
        return ModelMetadata(model["metadata"])

    @classmethod
    def dump_model_to_json(cls):
        model: Model = cls.work.data.get("model")
        if model is None:
            raise Exception("no model has been created")
        return model.to_json()

    @classmethod
    def make_model(cls):
        cls.work.make_model(show=False)

    @classmethod
    def plot_model(cls):
        model = cls.work.data.get("model")
        if model is not None:
            _, ax = plt.subplots(2, 1, figsize=(12, 9))
            plt.subplots_adjust(
                left=0.07, right=0.95, bottom=0.05, top=0.95, wspace=0.2, hspace=0.2
            )
            fig = model.plot_variogram(ax=ax)
            return cls.fig2png(fig)

    @classmethod
    def goodfit_test(cls) -> dict:
        if not cls.has_model():
            raise Exception("No model loaded")
        gfres: tuple = cls.work.goodfit_test()
        return {
            "Acceptance criteria": str(gfres[0]).lower(),
            "Normalized RMS error": f"{gfres[1]:.3f}",
        }

    @classmethod
    def goodfit_plot(cls):
        if not cls.has_model():
            raise Exception("No model loaded")
        fig = cls.work.goodfit_plot()
        return cls.fig2png(fig)
