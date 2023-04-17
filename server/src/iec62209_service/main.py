"""Main application to be deployed by uvicorn (or equivalent) server

"""
import logging

from fastapi import FastAPI
from iec62209_service.application import create_app


# SINGLETON FastAPI app
the_app: FastAPI = create_app()