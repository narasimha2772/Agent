from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Writer Service")

class GenerateRequest(BaseModel):
    keywords: List[str]
    tone: str = "informative"
    mode: str = "preview"

class GenerateResponse(BaseModel):
    drafts: List[str]

@app.post("/writer/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    drafts = []
    for kw in req.keywords:
        drafts.append(f"# {kw}\n\nThis is a preview draft generated without paid APIs.\n\n## Pros\n- ...\n\n## Cons\n- ...\n\n## CTA\nDiscover more in our newsletter (preview).\n")
    return GenerateResponse(drafts=drafts)

