import csv
from enum import Enum
from json import loads as jloads
from os.path import dirname, realpath

from fastapi import APIRouter, Depends, File, Request, UploadFile, status
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
)
from iec62209.work import Model, Work
from matplotlib import pyplot as plt
from pydantic import BaseModel

from .settings import ApplicationSettings

#
# Dependency injection
#


def get_app_settings(request: Request) -> ApplicationSettings:
    settings: ApplicationSettings = request.app.state.settings
    return settings


#
# API Models
#


# Training set generation
class TrainingSetConfig(BaseModel):
    fRangeMin: int
    fRangeMax: int
    sampleSize: int


class ModelInterface(BaseModel):
    systemName: str
    phantomType: str
    hardwareVersion: str
    softwareVersion: str


class SarFiltering(str, Enum):
    SAR1G = "SAR1G"
    SAR10G = "SAR10G"
    SARBOTH = "SARBOTH"


#
# API Handlers
#

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def get_index(settings: ApplicationSettings = Depends(get_app_settings)):
    """main index page"""
    html_content = (settings.CLIENT_OUTPUT_DIR / "index.html").read_text()
    return html_content


# Training set generation

# for data storage
class TrainingSetGeneration:
    # headings = ['no.', 'antenna', 'frequency', 'power', 'modulation', 'par', 'bandwidth', 'distance', 'angle', 'x', 'y', 'sar_1g', 'sar_10g', 'u_1g', 'u_10g']
    headings = []
    rows = []


@router.get("/training-set-generation:distribution", response_class=FileResponse)
async def get_training_set_distribution() -> FileResponse:
    response = FileResponse(dirname(realpath(__file__)) + "/../../testdata/mwl.png")
    response.media_type = "image/png"
    return response


@router.get("/training-set-generation:data", response_class=JSONResponse)
async def get_training_set_data() -> JSONResponse:
    return {
        "headings": TrainingSetGeneration.headings,
        "rows": TrainingSetGeneration.rows,
    }


@router.get("/training-set-generation:xport", response_class=PlainTextResponse)
async def export_training_set() -> PlainTextResponse:
    need_extra_colums = False
    headings = TrainingSetGeneration.headings
    if "sar_1g" not in headings:
        need_extra_colums = True
        headings += [SarFiltering.SAR10G.lower(), "u10g"]
    text = str(TrainingSetGeneration.headings).strip("[]")
    for row in TrainingSetGeneration.rows:
        if need_extra_colums:
            row += [0, 0]
        text += "\n" + str(row).strip("[]")
    return PlainTextResponse(text)


@router.post("/training-set-generation:generate", response_class=JSONResponse)
async def generate_training_set(config: TrainingSetConfig) -> JSONResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        TrainingSetGeneration.headings = []
        TrainingSetGeneration.rows = []
        if config:
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
            TrainingSetGeneration.headings = headings
            idx: int = 1
            for row in values:
                if need_to_add_ids:
                    row = [idx] + row
                    idx += 1
                TrainingSetGeneration.rows.append(row)
        else:
            message = f"Malformed parameters"
            end_status = status.HTTP_400_BAD_REQUEST
    except Exception as e:
        message = f"The IEC62209 package raised an exception: {e}"
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(message, status_code=end_status)


# Analysis & Creation


class ModelLoaded(BaseModel):
    filename: str = ""
    systemName: str
    phantomType: str
    hardwareVersion: str
    softwareVersion: str
    acceptanceCriteria: str
    normalizedRMSError: str


class ModelInterface:
    work: Work = Work()

    @staticmethod
    def fig2img(fig):
        import io

        buf = io.BytesIO()
        fig.savefig(buf)
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
    def load_init_sample(cls, filename):
        sample = cls.work.load_init_sample(filename, "sard10g")
        return sample.size() > 0

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
            return cls.fig2img(fig)

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
        return cls.fig2img(fig)


@router.post("/analysis-creation/training-data:load", response_class=HTMLResponse)
async def analysis_creation_load_training_data(
    file: UploadFile = File(...),
) -> HTMLResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        ModelInterface.clear()
        ok = ModelInterface.load_init_sample(file.name)
        if not ok:
            raise Exception("failed to load training data")
    except Exception as e:
        message = str(e)
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return HTMLResponse(message, status_code=end_status)


@router.post("/analysis-creation:create", response_class=JSONResponse)
async def analysis_creation_create() -> JSONResponse:
    end_status = status.HTTP_200_OK
    try:
        if not ModelInterface.has_sample():
            raise Exception("no sample loaded")
        ModelInterface.make_model(show=False)
        response = ModelInterface.goodfit_test()
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)


@router.get("/analysis-creation:xport", response_class=JSONResponse)
async def analysis_creation_xport(metadata: ModelLoaded) -> JSONResponse:
    response = ""
    end_status = status.HTTP_200_OK
    try:
        if not ModelInterface.has_model():
            raise Exception("model has not been created")
        meta = metadata.dict()
        data = ModelInterface.dump_model_to_json()
        response = {"metadata": meta, "model": data}
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)


@router.post("/load-training-data", response_class=JSONResponse)
async def post_training_data(file: UploadFile = File(...)) -> JSONResponse:
    try:
        contents = file.file.read()
        with open(file.filename, "wb") as f:
            f.write(contents)
    except Exception:
        return JSONResponse(
            {"message": "There was an error uploading the training data"}
        )
    finally:
        file.file.close()

    try:
        TrainingSetGeneration.rows = []
        with open(file.filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=",")
            TrainingSetGeneration.headings = next(csv_reader)
            for row in csv_reader:
                TrainingSetGeneration.rows.append(row)
    except Exception:
        return JSONResponse({"message": "There was an error reading the training data"})
    finally:
        file.file.close()
    return {
        "headings": TrainingSetGeneration.headings,
        "rows": TrainingSetGeneration.rows,
    }


# Load Model


@router.post("/load-model:load", response_class=JSONResponse)
async def load_model_load(file: UploadFile = File(...)) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        contents = jloads(file.file.read())
        try:
            meta = contents.get("metadata")
        except:
            # dummy
            meta = {
                "systemName": "Test Metadata",
                "phantomType": "here goes the phantom name",
                "hardwareVersion": "metadata is still missing",
                "softwareVersion": "the best version",
                "acceptanceCriteria": "full marks",
                "normalizedRMSError": "3.14159",
            }
        model = contents.get("model")
        if meta is None or model is None:
            raise Exception(f"Failed to load model from {file.filename}")

        loaded = ModelLoaded(meta)
        loaded.filename = file.filename
        response = loaded.dict()

    except Exception as e:
        response = {"message": str(e)}
        end_status = status.HTTP_400_BAD_REQUEST
    finally:
        file.file.close()

    return JSONResponse(response, status_code=end_status)


@router.get("/load-model:isloaded", response_class=JSONResponse)
async def load_model_isloaded() -> JSONResponse:
    response = {"isloaded": ModelInterface.has_model()}
    return response


@router.get("/load-model:reset")
async def load_model_reset() -> HTMLResponse:
    ModelInterface.clear()
    return HTMLResponse("")
