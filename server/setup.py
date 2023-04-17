import re
import sys
from pathlib import Path

from setuptools import find_packages, setup


def read_reqs(reqs_path: Path) -> set[str]:
    return {
        r
        for r in re.findall(
            r"(^[^#\n-][\w\[,\]]+[-~>=<.\w]*)",
            reqs_path.read_text(),
            re.MULTILINE,
        )
        if isinstance(r, str)
    }


CURRENT_DIR = Path(sys.argv[0] if __name__ == "__main__" else __file__).resolve().parent

# Hard requirements on third-parties and latest for in-repo packages
INSTALL_REQUIREMENTS = list( read_reqs(CURRENT_DIR / "requirements.txt") )


SETUP = dict(
    name="iec62209-service",
    version="0.1.0",
    description="Service built around publication-IEC62209",
    author=", ".join(
        (
            "Odei Maiz (odeimaiz)",
            "Simone Callegari",
            "Pedro Crespo-Valero (pcrespov)",
        )
    ),
    packages=find_packages(where="src"),
    package_dir={
        "": "src",
    },
    python_requires="~=3.10",
    install_requires=INSTALL_REQUIREMENTS,
)


if __name__ == "__main__":
    setup(**SETUP)
