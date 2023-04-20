from os.path import dirname, realpath
from pathlib import Path

from fastapi import APIRouter, Depends, Request, status
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


class TrainingTestGeneration(BaseModel):
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


#
# API Handlers
#

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def get_index(settings: ApplicationSettings = Depends(get_app_settings)):
    html_content = Path(settings.CLIENT_INDEX_PATH).read_text()
    return html_content


# Training set generation

# for data storage
class TrainingSetGeneration:
    sample: dict = {"headings": [], "rows": []}


@router.get("/training-set-generation:distribution", response_class=FileResponse)
async def get_training_set_distribution() -> FileResponse:
    response = FileResponse(dirname(realpath(__file__)) + "/../../testdata/mwl.png")
    response.media_type = "image/png"
    return response


@router.get("/training-set-generation:data", response_class=PlainTextResponse)
async def get_training_set_data() -> PlainTextResponse:
    response = PlainTextResponse(str(TrainingSetGeneration.sample))
    return response


@router.post("/training-set-generation:{operation}", response_class=JSONResponse)
async def generate_training_set(
    operation: str, config: TrainingSetConfig | None = None
) -> JSONResponse:
    try:
        if operation == "generate":
            if config:
                TrainingSetGeneration.sample = {"headings": [], "rows": []}
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
                TrainingSetGeneration.sample["headings"] = headings
                idx: int = 1
                for row in values:
                    if need_to_add_ids:
                        row = [idx] + row
                        idx += 1
                    TrainingSetGeneration.sample["rows"].append(row)
                return JSONResponse("")
            else:
                response = JSONResponse(
                    {"message": f"Malformed parameters for {operation} operation"}
                )
                response.status_code = status.HTTP_400_BAD_REQUEST
                return response
        elif operation == "xport":
            return JSONResponse(TrainingSetGeneration.sample)
        else:
            response = JSONResponse({"message": f"Unrecognized operation: {operation}"})
            response.status_code = status.HTTP_400_BAD_REQUEST
            return response
    except Exception as e:
        response = JSONResponse({"message": f"The IEC62209 raised an exception: {e}"})
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return response

    response = JSONResponse({"message": "Unsupported API call"})
    response.status_code = status.HTTP_418_IM_A_TEAPOT
    return response
