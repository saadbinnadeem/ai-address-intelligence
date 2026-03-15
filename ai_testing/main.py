from __future__ import annotations

import csv
import io
import json
import os
import re
from typing import Any

import google.generativeai as genai
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from pypdf import PdfReader


class Settings(BaseModel):
    gemini_api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    cors_origin: str = Field(default_factory=lambda: os.getenv("CORS_ORIGIN", "http://localhost:3000"))


settings = Settings()
if not settings.gemini_api_key:
    raise RuntimeError("GEMINI_API_KEY is required")


genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

prompt_template = """You are an address parsing engine specialized for Pakistan and India.

Users may write addresses in:
- English
- Roman Urdu
- Roman Hindi
- Informal spelling

Extract structured fields from the address.

Recognize abbreviations:

dha → DHA (Defence Housing Authority)
ph → Phase
blk → Block
st → Street
rd → Road
apt → Apartment
pl → Plot

Recognize landmarks such as:

near
opposite
beside
behind

Return JSON with these fields:

house_number
plot_number
street
block
phase
area
city
state
country
landmark
normalized_address

Return only valid JSON."""


class StructuredAddress(BaseModel):
    house_number: str | None = None
    plot_number: str | None = None
    street: str | None = None
    block: str | None = None
    phase: str | None = None
    area: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    landmark: str | None = None
    normalized_address: str = ""


class ParseAddressRequest(BaseModel):
    address: str


class ParseAddressResponse(BaseModel):
    original: str
    structured: StructuredAddress


class BulkItem(BaseModel):
    original: str
    structured: StructuredAddress


app = FastAPI(title="AI Address Parsing Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip().replace("```json", "").replace("```", "")
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not match:
        raise ValueError("Gemini response did not include valid JSON")
    return json.loads(match.group(0))


def _parse_with_gemini(address: str) -> StructuredAddress:
    response = model.generate_content(f"{prompt_template}\n\nAddress: {address}")
    parsed = _extract_json(response.text or "")
    return StructuredAddress.model_validate(parsed)


def _extract_csv_addresses(data: bytes) -> list[str]:
    text = data.decode("utf-8", errors="ignore")
    reader = csv.reader(io.StringIO(text))
    values = [cell.strip() for row in reader for cell in row if cell and cell.strip()]
    deduped = list(dict.fromkeys(value for value in values if len(value) > 2))
    return deduped


def _extract_pdf_addresses(data: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(data))
    lines: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        lines.extend(part.strip() for part in page_text.splitlines())
    deduped = list(dict.fromkeys(line for line in lines if len(line) > 2))
    return deduped


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/address/parse", response_model=ParseAddressResponse)
def parse_address(payload: ParseAddressRequest) -> ParseAddressResponse:
    address = payload.address.strip()
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")
    try:
        structured = _parse_with_gemini(address)
    except (ValueError, json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=502, detail=f"Invalid Gemini response: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return ParseAddressResponse(original=address, structured=structured)


@app.post("/api/address/bulk", response_model=list[BulkItem])
async def parse_bulk(file: UploadFile = File(...)) -> list[BulkItem]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    content = await file.read()
    name = file.filename.lower()
    content_type = file.content_type or ""

    try:
        if name.endswith(".csv") or "csv" in content_type:
            addresses = _extract_csv_addresses(content)
        elif name.endswith(".pdf") or "pdf" in content_type:
            addresses = _extract_pdf_addresses(content)
        else:
            raise HTTPException(status_code=400, detail="Only CSV and PDF files are supported")

        if not addresses:
            raise HTTPException(status_code=400, detail="No valid addresses found in uploaded file")

        results: list[BulkItem] = []
        for address in addresses:
            structured = _parse_with_gemini(address)
            results.append(BulkItem(original=address, structured=structured))
        return results
    except HTTPException:
        raise
    except (ValueError, json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=502, detail=f"Invalid Gemini response: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
