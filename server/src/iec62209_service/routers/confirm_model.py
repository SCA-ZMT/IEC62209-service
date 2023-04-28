from fastapi import APIRouter, status
from fastapi.responses import JSONResponse, Response, StreamingResponse

from ..utils.common import ModelInterface, SampleInterface

router = APIRouter(prefix="/confirm-model", tags=["confirm-model"])


@router.get("/confirm", response_class=JSONResponse)
async def confirm_model() -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        # storing these for later
        if not ModelInterface.compute_residuals():
            raise Exception("Error computing residuals")
        response = ModelInterface.residuals_test()
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    return JSONResponse(response, status_code=end_status)


@router.get("/qqplot", response_class=Response)
async def confirm_model_qqplot() -> Response:
    try:
        buf = ModelInterface.plot_residuals()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/deviations", response_class=Response)
async def confirm_model_deviations() -> Response:
    try:
        buf = SampleInterface.testSet.plot_deviations()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
