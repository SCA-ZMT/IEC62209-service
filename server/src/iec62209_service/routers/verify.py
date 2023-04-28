from fastapi import APIRouter, status
from fastapi.responses import JSONResponse, Response, StreamingResponse

from ..utils.common import ModelInterface, SampleInterface

router = APIRouter(prefix="/verify", tags=["verify"])


@router.get("/results", response_class=JSONResponse)
async def verify_results() -> JSONResponse:
    try:
        ModelInterface.raise_if_no_model()
        dataok: bool = ModelInterface.acceptance_criteria(SampleInterface.criticalSet)
        return {"Acceptance criteria": "Pass" if dataok else "Fail"}
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/deviations", response_class=Response)
async def verify_deviations() -> Response:
    try:
        ModelInterface.raise_if_no_model()
        buf = SampleInterface.criticalSet.plot_deviations()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
