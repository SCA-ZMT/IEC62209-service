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
async def verify_deviations(timestamp: str = "") -> Response:
    if not timestamp:
        # timestamp parameter to avoid browser caching the plot
        return Response(status_code=status.HTTP_400_BAD_REQUEST)
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
    from ..reports import texwriter
    from ..reports.texutils import typeset

    try:
        texpath = Path(tmp.name)

        # images

        imgpath = texpath / "images"
        mkdir(imgpath.as_posix())

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

        (texpath / "acceptance.tex").write_text(
            texwriter.write_sample_acceptance_tex(accepted)
        )

        (texpath / "sample_table.tex").write_text(
            texwriter.write_sample_table_tex(
                SampleInterface.criticalSet, texutils.ReportStage.VERIFICATION
            )
        )

        # main tex

        mainres = files(reports).joinpath("verification.tex")
        maintex = "report.tex"
        copyfile(mainres, texpath / maintex)

        mainpdf = texpath / typeset(texpath, maintex)

        return FileResponse(mainpdf, media_type="application/pdf")
    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
