from importlib.resources import files
from os import mkdir
from pathlib import Path
from shutil import copyfile

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse

from ..reports import texutils
from ..utils.common import ModelInterface, Residuals, SampleInterface

router = APIRouter(prefix="/confirm-model", tags=["confirm-model"])


@router.get("/confirm", response_class=JSONResponse)
async def confirm_model() -> JSONResponse:
    response = {}
    end_status = status.HTTP_200_OK
    try:
        # storing these for later
        if not ModelInterface.compute_residuals():
            raise Exception("Error computing residuals")
        residuals: Residuals = ModelInterface.residuals_test()
        accepted = ModelInterface.acceptance_criteria(SampleInterface.testSet)
        response = {
            "Acceptance criteria": "Pass" if accepted else "Fail",
            "Normality": residuals.print_normality(),
            "QQ location": residuals.print_qq_location(),
            "QQ scale": residuals.print_qq_scale(),
        }

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


@router.get("/pdf", response_class=Response)
async def analysis_creation_pdf(tmp=Depends(texutils.create_temp_folder)) -> Response:
    from .. import reports
    from ..reports import texwriter
    from ..reports.texutils import typeset

    try:
        texpath = Path(tmp.name)

        # images

        imgpath = texpath / "images"
        mkdir(imgpath.as_posix())

        with open(imgpath / "model-confirm-acceptance.png", "wb") as img:
            img.write(SampleInterface.testSet.plot_deviations().getvalue())

        with open(imgpath / "model-confirm-qqplot.png", "wb") as img:
            img.write(ModelInterface.plot_residuals().getvalue())

        # tables

        accepted: bool = ModelInterface.acceptance_criteria(SampleInterface.testSet)
        residuals: Residuals = ModelInterface.residuals_test()

        allgood = accepted and residuals.all_ok()

        with open(texpath / "onelinesummary.tex", "w") as fout:
            fout.write(
                texwriter.write_one_line_summary(
                    allgood, texutils.ReportStage.CONFIRMATION
                )
            )

        with open(texpath / "metadata.tex", "w") as fout:
            fout.write(
                texwriter.write_model_metadata_tex(ModelInterface.get_metadata())
            )

        with open(texpath / "summary.tex", "w") as fout:
            fout.write(texwriter.write_confirmation_summary_tex(accepted, residuals))

        with open(texpath / "sample_parameters.tex", "w") as fout:
            fout.write(
                texwriter.write_sample_parameters_tex(
                    SampleInterface.testSet.config, texutils.ReportStage.CONFIRMATION
                )
            )

        with open(texpath / "acceptance.tex", "w") as fout:
            fout.write(texwriter.write_sample_acceptance_tex(accepted))

        with open(texpath / "normality.tex", "w") as fout:
            fout.write(texwriter.write_normality_tex(residuals))

        with open(texpath / "similarity.tex", "w") as fout:
            fout.write(texwriter.write_similarity_tex(residuals))

        with open(texpath / "sample_table.tex", "w") as fout:
            fout.write(
                texwriter.write_sample_table_tex(
                    SampleInterface.testSet, texutils.ReportStage.CONFIRMATION
                )
            )

        # typeset report

        mainres = files(reports).joinpath("confirmation.tex")
        maintex = "report.tex"
        copyfile(mainres, texpath / maintex)

        mainpdf = texpath / typeset(texpath, maintex)

        return FileResponse(mainpdf, media_type="application/pdf")

    except Exception as e:
        return JSONResponse(
            {"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
