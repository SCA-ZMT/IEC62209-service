from fastapi import APIRouter

# from iec62209 import Work


router = APIRouter()


@router.post("/sample")
async def generate_sample():
    # work = Work()
    ...