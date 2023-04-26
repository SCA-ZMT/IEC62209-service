from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from ._meta import (
    API_VERSION,
    APP_FINISHED_BANNER_MSG,
    APP_STARTED_BANNER_MSG,
    PROJECT_NAME,
)
from .api import router
from .routers import (
    analysis_creation,
    load_model,
    load_training_data,
    meta,
    test_set_generation,
    training_set_generation,
)
from .settings import ApplicationSettings


@asynccontextmanager
async def _lifespan(app: FastAPI):
    print(APP_STARTED_BANNER_MSG, flush=True)

    yield

    print(APP_FINISHED_BANNER_MSG, flush=True)


def create_app():
    app = FastAPI(
        title=PROJECT_NAME,
        version=API_VERSION,
        lifespan=_lifespan,
    )
    app.state.settings = settings = ApplicationSettings()

    # routes
    app.include_router(router)
    app.include_router(meta.router)
    app.include_router(training_set_generation.router)
    app.include_router(test_set_generation.router)
    app.include_router(load_training_data.router)
    app.include_router(analysis_creation.router)
    app.include_router(load_model.router)
    app.include_router(test_set_generation.router)

    # static files
    app.mount("/", StaticFiles(directory=settings.CLIENT_OUTPUT_DIR), name="static")

    return app
