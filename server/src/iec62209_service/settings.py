from pathlib import Path

from pydantic import BaseSettings


class ApplicationSettings(BaseSettings):
    CLIENT_INDEX_PATH: Path
