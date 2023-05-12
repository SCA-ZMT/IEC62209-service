from importlib.resources import files
from os import mkdir
from pathlib import Path
from shutil import copyfile

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse

from .._meta import info
from ..reports import texutils
from ..utils.common import ModelInterface, SampleInterface

router = APIRouter(prefix="/verify", tags=["verify"])


@router.get("/results", response_class=JSONResponse)
async def verify_results() -> JSONResponse:
    try:
        ModelInterface.raise_if_no_model()
        # if no critical tests found, model is verified automatically
        data = SampleInterface.criticalSet
        dataok: bool = data.sample is not None and len(data.rows) == 0
        if not dataok:
            dataok = ModelInterface.acceptance_criteria(SampleInterface.criticalSet)
        return JSONResponse({"Acceptance criteria": "Pass" if dataok else "Fail"})
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/deviations", response_class=Response)
async def verify_deviations(timestamp: str = "") -> Response:
    if not timestamp:
        # timestamp parameter to avoid browser caching the plot
        return Response(status_code=status.HTTP_400_BAD_REQUEST)
    try:
        ModelInterface.raise_if_no_model()
        buf = SampleInterface.criticalSet.plot_deviations()
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/pdf", response_class=Response)
async def verify_pdf(tmp=Depends(texutils.create_temp_folder)) -> Response:
    from .. import reports
    from ..reports import texwriter
    from ..reports.texutils import typeset

    try:
        trivial_case: bool = len(SampleInterface.criticalSet.rows) == 0

        texpath = Path(tmp.name)

        # images

        imgpath = texpath / "images"
        mkdir(imgpath.as_posix())

        if not trivial_case:
            (imgpath / "critical-acceptance.png").write_bytes(
                SampleInterface.criticalSet.plot_deviations().getvalue()
            )

        # tables

        accepted: bool = ModelInterface.acceptance_criteria(SampleInterface.criticalSet)

        (texpath / "onelinesummary.tex").write_text(
            texwriter.write_one_line_summary(
                accepted, texutils.ReportStage.VERIFICATION
            )
        )

        (texpath / "metadata.tex").write_text(
            texwriter.write_model_metadata_tex(ModelInterface.get_metadata())
        )

        (texpath / "summary.tex").write_text(
            texwriter.write_verification_summary_tex(accepted)
        )

        (texpath / "sample_parameters.tex").write_text(
            texwriter.write_sample_parameters_tex(
                SampleInterface.criticalSet.config,
                ModelInterface.get_metadata(),
                texutils.ReportStage.VERIFICATION,
            )
        )

        (texpath / "outcome_critical.tex").write_text(
            texwriter.write_outcome_critical(
                SampleInterface.criticalSet.config.sampleSize
            )
        )

        (texpath / "acceptance.tex").write_text(
            texwriter.write_sample_acceptance_tex(accepted)
        )

        if not trivial_case:
            (texpath / "sample_table.tex").write_text(
                texwriter.write_sample_table_tex(
                    SampleInterface.criticalSet, texutils.ReportStage.VERIFICATION
                )
            )

        (texpath / "version.tex").write_text(info.__version__)

        # main tex

        if trivial_case:
            mainres = files(reports).joinpath("verification_trivial.tex")
        else:
            mainres = files(reports).joinpath("verification.tex")
        maintex = "report.tex"
        copyfile(mainres, texpath / maintex)

        mainpdf = texpath / typeset(texpath, maintex)

        return FileResponse(mainpdf, media_type="application/pdf")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
