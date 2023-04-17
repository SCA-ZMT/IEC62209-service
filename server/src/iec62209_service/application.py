from fastapi import FastAPI
from iec62209 import Work



from .api_routes import router

def create_app():
    app = FastAPI()

    app.include_router(router)

    return app


