from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .api import router
from .routers import (
    analysis_creation,
    load_model,
    load_training_data,
    test_set_generation,
    training_set_generation,
)
from .settings import ApplicationSettings


def create_app():
    app = FastAPI()
    app.state.settings = settings = ApplicationSettings()

    # routes
    app.include_router(router)
    app.include_router(training_set_generation.router)
    app.include_router(load_training_data.router)
    app.include_router(analysis_creation.router)
    app.include_router(load_model.router)
    app.include_router(test_set_generation.router)

    # static files
    app.mount("/", StaticFiles(directory=settings.CLIENT_OUTPUT_DIR), name="static")

    return app
