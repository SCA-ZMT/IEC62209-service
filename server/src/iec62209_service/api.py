from enum import Enum
from os.path import dirname, realpath
import csv

from fastapi import APIRouter, Depends, File, Request, status, UploadFile
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
)
from iec62209.work import Work
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
    measAreaX: int
    measAreaY: int
    sampleSize: int


class ModelCreation(BaseModel):
    systemName: str
    phantomType: str
    hardwareVersion: str
    softwareVersion: str


class SarFiltering(str, Enum):
    SAR1G = "SAR1G"
    SAR10G = "SAR10G"
    SARBOTH = "SARBOTH"


class ModelLoaded(BaseModel):
    systemName: str
    phantomType: str
    hardwareVersion: str
    softwareVersion: str
    filename: str
    acceptanceCriteria: str
    normalizedRMSError: str


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
        headings += ["sar_1g", "sar_10g", "u_1g", "u_10g"]
    text = str(TrainingSetGeneration.headings).strip("[]")
    for row in TrainingSetGeneration.rows:
        if need_extra_colums:
            row += [0, 0, 0, 0]
        text += "\n" + str(row).strip("[]")
    return PlainTextResponse(text)


@router.post("/training-set-generation:generate", response_class=JSONResponse)
async def generate_training_set(
    config: TrainingSetConfig | None = None,
) -> JSONResponse:
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


@router.post("/load-training-data", response_class=JSONResponse)
async def post_training_data(file: UploadFile = File(...)) -> JSONResponse:
    try:
        contents = file.file.read()
        with open(file.filename, 'wb') as f:
            f.write(contents)
    except Exception:
        return JSONResponse({"message": "There was an error uploading the training data"})
    finally:
        file.file.close()

    try:
        TrainingSetGeneration.rows = []
        with open(file.filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
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


@router.post("/load-model", response_model=ModelLoaded)
async def post_model(file: UploadFile = File(...)):
    try:
        contents = file.file.read()
        with open(file.filename, 'wb') as f:
            f.write(contents)
    except Exception:
        return JSONResponse({"message": "There was an error uploading the model"})
    finally:
        file.file.close()

    return ModelLoaded(
        filename = file.filename,
        systemName = "cSAR3D",
        phantomType = "Flat HSL",
        hardwareVersion = "SD C00 F01 AC",
        softwareVersion = "V5.2.0",
        acceptanceCriteria = "Pass",
        normalizedRMSError = "2",
    )
