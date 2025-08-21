from fastapi import FastAPI
from pydantic import BaseModel
import httpx
import os
from datetime import datetime

app = FastAPI(title="Research Reports API")

class ReportRequest(BaseModel):
    symbols: list[str] = ["BTC", "ETH"]
    mode: str = "preview"

class ReportResponse(BaseModel):
    summary: str
    pdf_path: str
    data_points: int

@app.post("/report", response_model=ReportResponse)
async def report(req: ReportRequest):
    data = []
    async with httpx.AsyncClient(timeout=10) as client:
      for sym in req.symbols:
        try:
          r = await client.get(f"https://api.coingecko.com/api/v3/coins/{'bitcoin' if sym=='BTC' else 'ethereum'}")
          data.append(r.json().get("market_data", {}).get("current_price", {}))
        except Exception:
          data.append({})
    out_dir = os.environ.get("ARTIFACTS_DIR", "/artifacts/research")
    os.makedirs(out_dir, exist_ok=True)
    pdf_path = os.path.join(out_dir, f"report-{datetime.utcnow().isoformat()}.pdf")
    with open(pdf_path, "w") as f:
      f.write("Preview Research Report\n")
      f.write(str(data))
    return ReportResponse(summary="Standard research preview generated", pdf_path=pdf_path, data_points=len(data))

