import email
import subprocess

from fastapi import APIRouter
from pydantic import BaseModel

from .._meta import API_VERSION, PROJECT_NAME, info

router = APIRouter(tags=["meta"])


class ServiceMetadata(BaseModel):
    project_name: str = PROJECT_NAME
    version: str = API_VERSION
    summary: str = info.get_summary()
    kernel_meta: dict = {}


def _pip_show(package_name: str) -> dict:
    output = subprocess.check_output(
        ["pip", "show", package_name], text=True, timeout=5
    )
    msg = email.message_from_string(output)
    return dict(msg.items())


try:
    _KERNEL_META = _pip_show("iec62209")
except Exception:
    _KERNEL_META = {}


@router.get("/meta", response_model=ServiceMetadata)
async def get_meta():
    """service metadata"""
    return ServiceMetadata(kernel_meta=_KERNEL_META)
