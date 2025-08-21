from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="POD Designer")

class DesignRequest(BaseModel):
    concept: str
    count: int = 10
    seed: int = 42

class DesignResponse(BaseModel):
    images_b64: List[str]

@app.post("/design", response_model=DesignResponse)
def design(req: DesignRequest):
    png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABeQGQq0GmkgAAAABJRU5ErkJggg=="
    return DesignResponse(images_b64=[png_b64 for _ in range(req.count)])

