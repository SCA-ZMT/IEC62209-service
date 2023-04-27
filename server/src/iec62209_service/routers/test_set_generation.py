from fastapi import APIRouter, status
from fastapi.responses import (
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    Response,
    StreamingResponse,
)

from .common import SampleConfig, SampleInterface

router = APIRouter(
    prefix="/test-set-generation",
    tags=["test-set-generation"],
    responses={404: {"error": "Backend not ready"}},
)


@router.post("/generate", response_class=HTMLResponse)
async def test_set_generate(config: SampleConfig) -> HTMLResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        SampleInterface.testSet.generate(config)
    except Exception as e:
        message = f"The IEC62209 package raised an exception: {e}"
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return HTMLResponse(message, status_code=end_status)


@router.get("/data", response_class=JSONResponse)
async def test_set_data() -> JSONResponse:
    return JSONResponse(SampleInterface.testSet.to_dict())


@router.get("/distribution", response_class=Response)
async def test_set_distribution() -> Response:
    try:
        buf = SampleInterface.testSet.plot_distribution()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/xport", response_class=PlainTextResponse)
async def test_set_xport() -> PlainTextResponse:
    text = str(SampleInterface.testSet.headings).strip("[]")
    for row in SampleInterface.testSet.rows:
        text += "\n" + str(row).strip("[]")
    return PlainTextResponse(text)


@router.get("/reset")
async def test_set_reset():
    SampleInterface.testSet.clear()
