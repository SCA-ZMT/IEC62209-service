from fastapi import APIRouter



router = APIRouter()


@router.post("/sample")
def generate_sample():
    ...