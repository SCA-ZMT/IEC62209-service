from tempfile import NamedTemporaryFile

from fastapi import APIRouter, status
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse

from ..utils.common import SampleConfig, SampleInterface

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


@router.get("/xport", response_class=FileResponse)
async def training_set_xport() -> FileResponse:
    tmp = NamedTemporaryFile(delete=False)
    SampleInterface.trainingSet.export_to_csv(tmp.name)
    return FileResponse(tmp.name, media_type="text/csv")


@router.post("/generate", response_class=JSONResponse)
async def training_set_generate(config: SampleConfig) -> JSONResponse:
    message = ""
    end_status = status.HTTP_200_OK
    try:
        SampleInterface.trainingSet.generate(config)
        SampleInterface.trainingSet.add_columns(["sar10g", "u10g"])
    except Exception as e:
        message = {"error": f"The IEC62209 package raised an exception: {e}"}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(message, status_code=end_status)
