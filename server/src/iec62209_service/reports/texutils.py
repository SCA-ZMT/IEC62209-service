from enum import Enum
from subprocess import PIPE, run
from tempfile import TemporaryDirectory


class ReportStage(int, Enum):
    CREATION = 0
    CONFIRMATION = 1
    VALIDATION = 2


def typeset(folder, main: str) -> str:
    rerun = True
    while rerun:
        proc = run(
            ["pdflatex", "-interaction=nonstopmode", main],
            cwd=folder,
            stdout=PIPE,
        )
        rerun = proc.stdout.find(b"Rerun") != -1
    return main.replace(".tex", ".pdf")


def create_temp_folder():
    tmp = TemporaryDirectory(ignore_cleanup_errors=True)
    try:
        yield tmp
    finally:
        tmp.cleanup()
