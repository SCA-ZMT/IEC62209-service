from subprocess import PIPE, run


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
