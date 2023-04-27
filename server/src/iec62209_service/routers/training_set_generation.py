from fastapi import APIRouter, status
from fastapi.responses import (
    JSONResponse,
    PlainTextResponse,
    Response,
    StreamingResponse,
)

from .common import SampleConfig, SampleInterface, SarFiltering

router = APIRouter(
    prefix="/training-set-generation",
    tags=["training-set-generation"],
    responses={404: {"error": "Backend not ready"}},
)

# Training set generation


@router.get("/reset")
async def training_set_reset():
    SampleInterface.trainingSet.clear()


@router.get("/distribution", response_class=Response)
async def training_set_distribution() -> Response:
    try:
        buf = SampleInterface.trainingSet.plot_distribution()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/data", response_class=JSONResponse)
async def training_set_data() -> JSONResponse:
    return JSONResponse(SampleInterface.trainingSet.to_dict())


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
async def training_set_generate(config: SampleConfig) -> JSONResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        SampleInterface.trainingSet.generate(config)
    except Exception as e:
        message = f"The IEC62209 package raised an exception: {e}"
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(message, status_code=end_status)
