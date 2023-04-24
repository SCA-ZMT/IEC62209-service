from json import loads as jloads

from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import JSONResponse, Response

from .common import IsLoaded, ModelInterface, ModelMetadata

router = APIRouter(prefix="/model", tags=["model"])


@router.post("/load", response_class=JSONResponse)
async def load_model_load(file: UploadFile = File(...)) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        contents = jloads(file.file.read())
        try:
            meta = contents.get("metadata")
        except:
            # dummy
            meta = {
                "systemName": "Test Metadata",
                "phantomType": "here goes the phantom name",
                "hardwareVersion": "metadata is still missing",
                "softwareVersion": "the best version",
                "acceptanceCriteria": "full marks",
                "normalizedRMSError": "3.14159",
            }
        model = contents.get("model")
        if meta is None or model is None:
            raise Exception(f"Failed to load model from {file.filename}")

        loaded = ModelMetadata(meta)
        loaded.filename = file.filename
        response = loaded.dict()

    except Exception as e:
        response = {"message": str(e)}
        end_status = status.HTTP_400_BAD_REQUEST
    finally:
        file.file.close()

    return JSONResponse(response, status_code=end_status)


@router.get("/isloaded", response_class=JSONResponse)
async def load_model_isloaded() -> JSONResponse:
    return IsLoaded(ModelInterface.has_model()).to_json()


@router.get("/reset", response_class=Response)
async def load_model_reset() -> Response:
    ModelInterface.clear()
    return Response("ok")
