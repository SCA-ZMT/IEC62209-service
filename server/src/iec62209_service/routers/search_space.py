from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from .common import ModelInterface

router = APIRouter(prefix="/search-space", tags=["search-space"])


@router.post("/search")
async def search_space():
    try:
        critsample = ModelInterface.explore_space()
        return JSONResponse(critsample)
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
