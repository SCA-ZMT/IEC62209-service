from importlib.resources import files
from os import mkdir
from pathlib import Path
from shutil import copyfile

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse

from ..reports import texutils
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


@router.get("/pdf", response_class=Response)
async def verify_pdf(tmp=Depends(texutils.create_temp_folder)) -> Response:
    from .. import reports
    from ..reports import tables
    from ..reports.texutils import typeset

    texpath = Path(tmp.name)

    # images

    imgpath = texpath / "images"
    mkdir(imgpath.as_posix())

    with open(imgpath / "critical-acceptance.png", "wb") as img:
        img.write(SampleInterface.criticalSet.plot_deviations().getvalue())

    # tables

    accepted: bool = ModelInterface.acceptance_criteria(SampleInterface.criticalSet)

    with open(texpath / "metadata.tex", "w") as fout:
        fout.write(tables.write_model_metadata_tex(ModelInterface.get_metadata()))

    with open(texpath / "summary.tex", "w") as fout:
        fout.write(tables.write_verification_summary_tex(accepted))

    with open(texpath / "sample_parameters.tex", "w") as fout:
        fout.write(
            tables.write_sample_parameters_tex(
                SampleInterface.criticalSet.config, texutils.ReportStage.VERIFICATION
            )
        )

    with open(texpath / "acceptance.tex", "w") as fout:
        fout.write(tables.write_sample_acceptance_tex(accepted))

    with open(texpath / "sample_table.tex", "w") as fout:
        fout.write(
            tables.write_sample_table_tex(
                SampleInterface.criticalSet, texutils.ReportStage.VERIFICATION
            )
        )

    # main tex

    mainres = files(reports).joinpath("verification.tex")
    maintex = "report.tex"
    copyfile(mainres, texpath / maintex)

    mainpdf = texpath / typeset(texpath, maintex)

    return FileResponse(mainpdf, media_type="application/pdf")
