from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .api import router
from .settings import ApplicationSettings


def create_app():
    app = FastAPI()
    app.state.settings = settings = ApplicationSettings()

    # routes
    app.include_router(router)
    app.mount("/", StaticFiles(directory=settings.CLIENT_OUTPUT_DIR), name="static")

    return app
