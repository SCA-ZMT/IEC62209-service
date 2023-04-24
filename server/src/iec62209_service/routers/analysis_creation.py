from fastapi import APIRouter, status
from fastapi.responses import FileResponse, JSONResponse, Response

from .common import ModelInterface, ModelMetadata

router = APIRouter(prefix="/analysis-creation", tags=["analysis-creation"])


@router.get("/reset", response_class=Response)
async def analysis_creation_reset() -> Response:
    ModelInterface.clear()


@router.post("/create", response_class=JSONResponse)
async def analysis_creation_create() -> JSONResponse:
    end_status = status.HTTP_200_OK
    try:
        if not ModelInterface.has_sample():
            raise Exception("no sample loaded")
        ModelInterface.make_model()
        response = ModelInterface.goodfit_test()
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)


@router.get("/variogram", response_class=Response)
async def analysis_creation_variogram():
    try:
        ModelInterface.raise_if_no_model()
        buf = ModelInterface.plot_model()
        return FileResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/deviations", response_class=Response)
async def analysis_creation_deviations():
    try:
        ModelInterface.raise_if_no_model()

    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/marginals", response_class=Response)
async def analysis_creation_marginals():
    try:
        ModelInterface.raise_if_no_model()
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/xport", response_class=JSONResponse)
async def analysis_creation_xport(metadata: ModelMetadata) -> JSONResponse:
    response = ""
    end_status = status.HTTP_200_OK
    try:
        ModelInterface.raise_if_no_model()
        meta = metadata.dict()
        data = ModelInterface.dump_model_to_json()
        response = {"metadata": meta, "model": data}
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)
