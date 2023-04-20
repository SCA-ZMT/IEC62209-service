from enum import Enum
from pathlib import Path

from fastapi import APIRouter, Depends, Request, status, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from iec62209.work import Work
from pydantic import BaseModel, conint

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


class Demo(BaseModel):
    x: bool
    y: int
    z: conint(ge=2)


class MyEnum(str, Enum):
    FOO = "FOO"
    BAR = "BAR"



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


@router.post("/training-set-generation:create", status_code=status.HTTP_204_NO_CONTENT)
async def create_training_set(body: TrainingTestGeneration):
    print(body)


@router.post("/training-set-generation:xport", response_class=FileResponse)
async def xport_training_set():
    some_file_path = "../my_model.json"
    return some_file_path


@router.get("/training-set-generation/data")
async def get_training_data():
    return


@router.get("/training-set-generation/distribution", response_class=FileResponse)
async def get_training_distribution():
    some_file_path = "../my_model.json"
    return some_file_path



@router.get("/demo/{name}", response_model=Demo)
async def demo(body: Demo, name: str, enabled: MyEnum = MyEnum.BAR):
    return Demo(x=body.x, y=body.y + 3, z=body.x + 33)


@router.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}


@router.post("/sample")
async def generate_sample():
    work = Work()
    print(work)
