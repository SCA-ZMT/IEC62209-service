from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/confirm-model", tags=["confirm-model"])


@router.get("/confirm", response_class=JSONResponse)
async def confirm_model() -> JSONResponse:
    return {}
