from __future__ import annotations
import csv
import io
import json
import os
import re
from typing import Any
from dotenv import load_dotenv

import google.generativeai as genai
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from pypdf import PdfReader

load_dotenv()

class Settings(BaseModel):
    gemini_api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    cors_origin: str = Field(default_factory=lambda: os.getenv("CORS_ORIGIN", "*"))
    model_name: str = "gemini-3.1-flash-lite-preview"

settings = Settings()

if not settings.gemini_api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel(
    model_name=settings.model_name,
    generation_config={"response_mime_type": "application/json"}
)

prompt_template = """Extract and translate address components for India/Pakistan. 
CRITICAL: You must translate all Roman Urdu/Hindi regional terms into standard English. 
Examples: 'gali' -> 'street'/'lane', 'piche' -> 'behind', 'mohallah' -> 'area'/'neighborhood', 'samne' -> 'opposite', 'sarak' -> 'road', 'makan' -> 'house'. 
The output values must be strictly in English.
Return JSON: house_number, plot_number, street, block, phase, area, city, state, country, landmark, normalized_address."""

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

app = FastAPI(title="AI Address Parsing Platform", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _parse_with_gemini(address: str) -> StructuredAddress:
    response = model.generate_content(f"{prompt_template}\nAddress: {address}")
    return StructuredAddress.model_validate_json(response.text)

def _extract_csv_addresses(data: bytes) -> list[str]:
    text = data.decode("utf-8", errors="ignore")
    reader = csv.reader(io.StringIO(text))
    return list(dict.fromkeys(cell.strip() for row in reader for cell in row if cell and len(cell.strip()) > 2))

def _extract_pdf_addresses(data: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(data))
    lines: list[str] = []
    for page in reader.pages:
        lines.extend(part.strip() for part in (page.extract_text() or "").splitlines())
    return list(dict.fromkeys(line for line in lines if len(line) > 2))

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": settings.model_name}

@app.post("/api/address/parse", response_model=ParseAddressResponse)
def parse_address(payload: ParseAddressRequest) -> ParseAddressResponse:
    address = payload.address.strip()
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")
    try:
        structured = _parse_with_gemini(address)
        return ParseAddressResponse(original=address, structured=structured)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/api/address/bulk", response_model=list[BulkItem])
async def parse_bulk(file: UploadFile = File(...)) -> list[BulkItem]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    content = await file.read()
    name = file.filename.lower()
    
    if name.endswith(".csv"):
        addresses = _extract_csv_addresses(content)
    elif name.endswith(".pdf"):
        addresses = _extract_pdf_addresses(content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

    results: list[BulkItem] = []
    for address in addresses:
        try:
            results.append(BulkItem(original=address, structured=_parse_with_gemini(address)))
        except:
            continue
    return results