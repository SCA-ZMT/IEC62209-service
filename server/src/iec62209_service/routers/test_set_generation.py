from os.path import dirname, realpath

from fastapi import APIRouter, status
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse

from .common import SampleConfig, SampleInterface, SarFiltering

router = APIRouter(
    prefix="/training-set-generation",
    tags=["training-set-generation"],
    responses={404: {"error": "Backend not ready"}},
)

# Training set generation

# basic training set API
class TrainingSetConfig(SampleConfig):
    fAreaX: int | None = 120
    fAreaY: int | None = 240


@router.get("/reset")
async def training_set_reset():
    SampleInterface.trainingSet.clear()


@router.get("/distribution", response_class=FileResponse)
async def training_set_distribution() -> FileResponse:
    return FileResponse(
        dirname(realpath(__file__)) + "/../../../../assets/mwl.png",
        media_type="image/png",
    )


@router.get("/data", response_class=JSONResponse)
async def training_set_data() -> JSONResponse:
    return SampleInterface.trainingSet


@router.get("/xport", response_class=PlainTextResponse)
async def training_set_xport() -> PlainTextResponse:
    need_extra_colums = False
    headings = SampleInterface.trainingSet.headings
    if "sar_1g" not in headings:
        need_extra_colums = True
        headings += [SarFiltering.SAR10G.lower(), "u10g"]
    text = str(SampleInterface.trainingSet.headings).strip("[]")
    for row in SampleInterface.trainingSet.rows:
        if need_extra_colums:
            row += [0, 0]
        text += "\n" + str(row).strip("[]")
    return PlainTextResponse(text)


@router.post("/generate", response_class=JSONResponse)
async def training_set_generate(config: TrainingSetConfig) -> JSONResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        message = SampleInterface.generate_sample(config)
    except Exception as e:
        message = f"The IEC62209 package raised an exception: {e}"
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(message, status_code=end_status)
