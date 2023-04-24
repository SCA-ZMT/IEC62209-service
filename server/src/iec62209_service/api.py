from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from .settings import ApplicationSettings

#
# Dependency injection
#


def get_app_settings(request: Request) -> ApplicationSettings:
    settings: ApplicationSettings = request.app.state.settings
    return settings


#
# API Handlers
#

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def get_index(settings: ApplicationSettings = Depends(get_app_settings)):
    """main index page"""
    html_content = (settings.CLIENT_OUTPUT_DIR / "index.html").read_text()
    return html_content
