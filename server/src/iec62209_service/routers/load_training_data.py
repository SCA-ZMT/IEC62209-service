from os import remove
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import JSONResponse, Response

from .common import ModelInterface

router = APIRouter(prefix="/training-data", tags=["training-data"])


@router.get("/reset", response_class=Response)
async def training_data_clear() -> Response:
    ModelInterface.clear()


@router.post("/load", response_class=JSONResponse)
async def training_data_load(
    file: UploadFile = File(...),
) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        ModelInterface.clear()

        # need to write to a temp file
        tmp = NamedTemporaryFile(delete=False)
        tmp.write(file.file.read())
        tmp.close()
        response = ModelInterface.load_init_sample(tmp.name)
        remove(tmp.name)

    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)
