from tempfile import NamedTemporaryFile

from fastapi import APIRouter, status
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse

from .common import ModelInterface, SampleInterface

router = APIRouter(prefix="/search-space", tags=["search-space"])


@router.post("/search", response_class=JSONResponse)
async def search_space() -> JSONResponse:
    try:
        critsample = ModelInterface.explore_space()
        return JSONResponse(critsample)
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/distribution", response_class=Response)
async def search_space_distribution() -> Response:
    try:
        buf = SampleInterface.criticalSet.plot_distribution()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/xport", response_class=FileResponse)
async def critical_set_xport() -> FileResponse:
    tmp = NamedTemporaryFile(delete=False)
    SampleInterface.criticalSet.export_to_csv(tmp.name)
    return FileResponse(tmp.name, media_type="text/csv")
