from importlib.resources import as_file, files
from json import dumps as jdumps
from pathlib import Path
from subprocess import PIPE, run
from tempfile import TemporaryDirectory

from fastapi import APIRouter, Depends, status
from fastapi.responses import (
    FileResponse,
    JSONResponse,
    PlainTextResponse,
    Response,
    StreamingResponse,
)

from .. import reports
from ..utils.common import Goodfit, ModelInterface, ModelMetadata, SampleInterface

router = APIRouter(prefix="/analysis-creation", tags=["analysis-creation"])


def create_temp_folder():
    tmp = TemporaryDirectory(ignore_cleanup_errors=True)
    try:
        yield tmp
    finally:
        tmp.cleanup()


def typeset(folder, main: str):
    rerun = True
    while rerun:
        proc = run(
            ["pdflatex", "-interaction=nonstopmode", main],
            cwd=folder,
            stdout=PIPE,
        )
        rerun = proc.stdout.find(b"Rerun") != -1


@router.get("/reset", response_class=Response)
async def analysis_creation_reset() -> Response:
    ModelInterface.clear()


@router.post("/create", response_class=JSONResponse)
async def analysis_creation_create() -> JSONResponse:
    end_status = status.HTTP_200_OK
    try:
        if not ModelInterface.has_init_sample():
            raise Exception("no sample loaded")
        ModelInterface.make_model()
        result: Goodfit = ModelInterface.goodfit_test()

        response = {
            "Acceptance criteria": "Pass" if result.accept else "Fail",
            "Normalized RMS error": f"{float((result.gfres[1]) * 100):.1f} "
            + ("< 25% " if result.gfres[0] else "> 25% ")
            + ("(Pass)" if result.gfres[0] else "(Fail)"),
        }

    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(response, status_code=end_status)


@router.get("/variogram", response_class=Response)
async def analysis_creation_variogram():
    try:
        ModelInterface.raise_if_no_model()
        buf = ModelInterface.plot_model()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/deviations", response_class=Response)
async def analysis_creation_deviations():
    try:
        ModelInterface.raise_if_no_model()
        buf = SampleInterface.trainingSet.plot_deviations()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/marginals", response_class=Response)
async def analysis_creation_marginals():
    try:
        ModelInterface.raise_if_no_model()
        buf = SampleInterface.trainingSet.plot_marginals()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return Response(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("/xport", response_class=PlainTextResponse)
async def analysis_creation_xport(metadata: ModelMetadata) -> PlainTextResponse:
    response = ""
    end_status = status.HTTP_200_OK
    try:
        ModelInterface.raise_if_no_model()
        data = ModelInterface.dump_model_to_json()
        data["metadata"] = dict(metadata)
        if SampleInterface.trainingSet.config.sampleSize > 0:
            data["metadata"] = metadata | dict(SampleInterface.trainingSet.config)
        response = jdumps(data)
    except Exception as e:
        response = {"error": str(e)}
        end_status = status.HTTP_500_INTERNAL_SERVER_ERROR
    return PlainTextResponse(
        response, media_type="application/json", status_code=end_status
    )


@router.get("/pdf", response_class=Response)
async def analysis_creation_static_pdf(tmp=Depends(create_temp_folder)) -> Response:
    mainres = files(reports).joinpath("gpi-creation.tex")
    with as_file(mainres) as maintex:
        with open(Path(tmp.name) / "report.tex", "w") as tex:
            tex.write(maintex.read_text())

    typeset(tmp.name, "report.tex")

    return FileResponse((Path(tmp.name) / "report.pdf"), media_type="application/pdf")


async def analysis_creation_pdf(tmp=Depends(create_temp_folder)) -> Response:
    ...
