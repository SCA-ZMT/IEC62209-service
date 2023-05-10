from os import remove
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, UploadFile, status
from fastapi.responses import JSONResponse

from ..utils.common import ModelInterface, SampleInterface

router = APIRouter(prefix="/test-data", tags=["test-data"])


@router.get("/reset")
async def test_data_reset():
    SampleInterface.testSet.clear()


@router.post("/load", response_class=JSONResponse)
async def test_data_load(file: UploadFile = File(...)) -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        if len([x for x in file.file.readlines() if x.strip()]) < 2:
            # only headings, empty critical sample
            raise Exception("Empty data set")
        file.file.seek(0)
        # need to write to a temp file
        tmp = NamedTemporaryFile(delete=False)
        tmp.write(file.file.read())
        tmp.close()
        response = ModelInterface.load_test_sample(tmp.name)
        remove(tmp.name)

        if not ModelInterface.model_covers_sample(SampleInterface.testSet):
            SampleInterface.testSet.clear()
            raise Exception(
                "The test data sample extends outside the range of the model"
            )

    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)
