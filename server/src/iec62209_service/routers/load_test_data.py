from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import JSONResponse

from .common import SampleInterface

router = APIRouter(prefix="test-data", tags=["test-data"])


@router.get("/reset")
async def test_data_reset():
    SampleInterface.testSet.clear()


@router.post("/load", response_class=JSONResponse)
async def test_data_load(file: UploadFile = File(...)) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        ...
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)
