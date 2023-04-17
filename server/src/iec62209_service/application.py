from fastapi import FastAPI

from .api import router
from .settings import ApplicationSettings


def create_app():
    app = FastAPI()
    app.include_router(router)

    app.state.settings = ApplicationSettings()

    return app
