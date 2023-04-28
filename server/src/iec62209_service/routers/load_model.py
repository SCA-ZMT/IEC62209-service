from os import remove
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import JSONResponse, Response

from ..utils.common import IsLoaded, ModelInterface, ModelMetadata, SampleInterface

router = APIRouter(prefix="/model", tags=["model"])


@router.post("/load", response_class=JSONResponse)
async def load_model_load(file: UploadFile = File(...)) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    tmp = NamedTemporaryFile(delete=False)
    try:
        tmp.write(file.file.read())
        tmp.close()

        ModelInterface.load_model_from_json(tmp.name)

        ModelInterface.raise_if_no_model()

        meta = ModelInterface.get_metadata()
        loaded = ModelMetadata(**meta)
        # fix filename
        loaded.filename = file.filename
        metadata = loaded.dict()

        response = {"metadata": metadata, "data": SampleInterface.trainingSet.to_dict()}

    except Exception as e:
        response = {"message": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    finally:
        file.file.close()
        remove(tmp.name)

    return JSONResponse(response, status_code=end_status)


@router.get("/isloaded", response_class=JSONResponse)
async def load_model_isloaded() -> JSONResponse:
    return IsLoaded(ModelInterface.has_model()).to_json()


@router.get("/reset", response_class=Response)
async def load_model_reset() -> Response:
    ModelInterface.clear()
    return Response("ok")
