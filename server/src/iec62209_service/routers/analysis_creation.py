from importlib.resources import files
from json import dumps as jdumps
from os import mkdir
from pathlib import Path
from shutil import copyfile
from tempfile import TemporaryDirectory

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response

from .. import reports
from ..utils.common import Goodfit, ModelInterface, ModelMetadata, SampleInterface

router = APIRouter(prefix="/analysis-creation", tags=["analysis-creation"])


def create_temp_folder():
    tmp = TemporaryDirectory(ignore_cleanup_errors=True)
    try:
        yield tmp
    finally:
        tmp.cleanup()


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
        ModelInterface.set_metadata(metadata)
        data = ModelInterface.dump_model_to_json()
        # data["metadata"] = dict(metadata)
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
async def analysis_creation_pdf(tmp=Depends(create_temp_folder)) -> Response:
    from ..reports import tables
    from ..reports.texutils import typeset

    texpath = Path(tmp.name)

    # print images

    imgpath = texpath / "images"
    mkdir(imgpath.as_posix())

    with open(imgpath / "model-creation-distribution.png", "wb") as img:
        img.write(SampleInterface.trainingSet.plot_distribution().getvalue())

    with open(imgpath / "model-creation-acceptance.png", "wb") as img:
        img.write(SampleInterface.trainingSet.plot_deviations().getvalue())

    with open(imgpath / "model-creation-semivariogram.png", "wb") as img:
        img.write(ModelInterface.plot_model().getvalue())

    with open(imgpath / "model-creation-marginals.png", "wb") as img:
        img.write(SampleInterface.trainingSet.plot_marginals().getvalue())

    # print tables

    with open(texpath / "metadata.tex", "w") as fout:
        fout.write(tables.write_model_metadata_tex(ModelInterface.get_metadata()))

    with open(texpath / "summary.tex", "w") as fout:
        fout.write(tables.write_model_creation_summary_tex(ModelInterface.goodfit))

    with open(texpath / "sample_parameters.tex", "w") as fout:
        fout.write(
            tables.write_sample_parameters_tex(SampleInterface.trainingSet.config)
        )

    with open(texpath / "acceptance.tex", "w") as fout:
        fout.write(
            tables.write_model_creation_acceptance_tex(ModelInterface.goodfit.accept)
        )

    with open(texpath / "gfres.tex", "w") as fout:
        fout.write(tables.write_model_fitting_tex(ModelInterface.goodfit.gfres))

    with open(texpath / "sample_table.tex", "w") as fout:
        fout.write(tables.write_sample_table_tex(SampleInterface.trainingSet))

    # typeset report

    mainres = files(reports).joinpath("creation.tex")
    maintex = "report.tex"
    copyfile(mainres, texpath / maintex)

    mainpdf = texpath / typeset(texpath, maintex)

    return FileResponse(mainpdf, media_type="application/pdf")
