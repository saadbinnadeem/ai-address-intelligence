from __future__ import annotations
import os
import re
import json
import hashlib
import asyncio
import logging
import httpx
from google import genai
from google.genai import types
from typing import Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("address_parser")

class Settings(BaseModel):
    google_maps_api_key: str = Field(default_factory=lambda: os.getenv("GOOGLE_MAPS_API_KEY", ""))
    cors_origin: str = Field(default_factory=lambda: os.getenv("CORS_ORIGIN", "http://localhost:3000"))
    gemini_api_key: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))

settings = Settings()

client = genai.Client(api_key=settings.gemini_api_key)

app = FastAPI(title="Global AI Address Parsing Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROMAN_DICT = {
    "khi": "karachi", "lhr": "lahore", "isb": "islamabad",
    "malr": "malir", "gali": "street", "sarak": "road",
    "mohalla": "area", "piche": "behind", "samne": "opposite",
    "sq": "square", "apt": "apartment", "bldg": "building"
}

# Extremely simple in-memory dictionary cache to replace Redis
in_memory_cache: dict[str, Any] = {}

class AddressQuery(BaseModel):
    address: str
    enable_landmark_enrichment: bool = True
    search_radius: int = 20

class GeminiAddressExtraction(BaseModel):
    house_number: str | None
    plot_number: str | None
    street: str | None
    block: str | None
    phase: str | None
    landmark: str | None
    area: str | None
    city: str | None
    state: str | None
    postal_code: str | None 
    country: str | None

class BestLandmarkRanking(BaseModel):
    best_landmark_name: str | None

class GoogleMapsData(BaseModel):
    formatted_address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    place_id: str | None = None
    location_type: str | None = None
    nearest_landmark: str | None = None
    enriched_by_places_api: bool = False
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None

class StructuredAddress(BaseModel):
    house_number: str | None = None
    plot_number: str | None = None
    street: str | None = None
    block: str | None = None
    phase: str | None = None
    landmark: str | None = None
    area: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    normalized_address: str = ""
    confidence: float = 0
    google_maps_data: GoogleMapsData | None = None

class ParseResponse(BaseModel):
    original: str
    normalized_input: str
    structured: StructuredAddress
    source: str 

async def cache_get(key: str):
    return in_memory_cache.get(key)

async def cache_set(key: str, value: Any):
    in_memory_cache[key] = value

def cache_key(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()

def fallback_regex_parser(input_text: str) -> dict:
    text = input_text.lower()
    for k, v in ROMAN_DICT.items():
        text = re.sub(rf'\b{k}\b', v, text)
    out = {k: None for k in GeminiAddressExtraction.__annotations__.keys()}
    house_match = re.search(r'\b\d+/\d+\b|\b[a-z]-\d+\b', text)
    if house_match:
        out["house_number"] = house_match.group(0).upper()
        text = text.replace(house_match.group(0), "")
    block_match = re.search(r'\b(?:block|sector|phase)\s*[a-z0-9]+\b', text)
    if block_match:
        val = block_match.group(0).title()
        if "Phase" in val:
            out["phase"] = val
        else:
            out["block"] = val
        text = text.replace(block_match.group(0), "")
    leftover = re.sub(r'\s+', ' ', text).strip()
    if len(leftover) > 3:
        out["area"] = leftover.title()
    return out

async def parse_with_gemini(input_text: str) -> dict:
    system_prompt = """
    Parse global addresses into precise fields.
    1. Translate regional slang to standard English. 
    2. PATTERN RECOGNITION: Treat standalone fractions (e.g., '58/12') or hyphenated codes as the 'house_number'.
    3. Treat stray acronyms before numbers (e.g., 'fs', 'blk') as the 'block' and format properly.
    4. POSTAL CODES: Identify zip codes or postal codes and assign them STRICTLY to 'postal_code'.
    5. Infer missing city, state, and country for known societies/projects/localities.
    6. LANDMARK RULE: Extract any mentioned landmark (e.g., 'near Farooqi Masjid', 'opp Jinnah Sq'). If none, leave null.
    """
    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=input_text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=GeminiAddressExtraction,
                    temperature=0.0,
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Exception: {str(e)}")
            if "503" in str(e) or "429" in str(e):
                if attempt < max_retries - 1:
                    await asyncio.sleep(1) 
                    continue
            return {}
    return {}

async def rank_best_landmark_with_gemini(pois: list[dict], address_context: str) -> str | None:
    if not pois:
        return None
        
    system_prompt = f"""
    You are an expert local logistics and delivery dispatcher for South Asia (Pakistan, India, etc).
    A rider is trying to deliver to this general area: "{address_context}".
    
    Here is a JSON list of nearby Points of Interest (POIs) fetched from the map:
    {json.dumps(pois, indent=2)}
    
    YOUR JOB: Filter out the noise and select the SINGLE best, most recognizable delivery landmark.
    - PRIORITIZE: Mosques (Masjids), Hospitals, Schools/Colleges, Famous Malls, Major Chowrangis/Roads, Petrol Pumps.
    - REJECT: Random small shops, generic offices, ATMs, temporary stalls, or vague names.
    
    If one is highly recognizable, return its name exactly as written. If they are all junk, return null.
    """
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents="Select the best landmark.",
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=BestLandmarkRanking,
                temperature=0.0,
            ),
        )
        result = json.loads(response.text)
        return result.get("best_landmark_name")
    except Exception as e:
        logger.error(f"Gemini Ranking Exception: {str(e)}")
        return None

async def fetch_google_maps_data(address: str, landmark: str | None = None) -> GoogleMapsData | None:
    if not settings.google_maps_api_key:
        return None
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    queries_to_try = [f"{landmark}, {address}"] if landmark else []
    queries_to_try.append(address)
    
    async with httpx.AsyncClient(timeout=10.0) as http_client:
        for query in queries_to_try:
            try:
                response = await http_client.get(url, params={
                    "address": query,
                    "key": settings.google_maps_api_key
                })
                response.raise_for_status()
                data = response.json()
                if data.get("status") == "OK" and data.get("results"):
                    result = data["results"][0]
                    geometry = result.get("geometry", {})
                    location = geometry.get("location", {})
                    loc_type = geometry.get("location_type")
                    
                    if loc_type == "APPROXIMATE" and query != queries_to_try[-1]:
                        continue

                    city, state, country, postal = None, None, None, None
                    for comp in result.get("address_components", []):
                        types = comp.get("types", [])
                        if "locality" in types:
                            city = comp.get("long_name")
                        if "administrative_area_level_1" in types:
                            state = comp.get("long_name")
                        if "country" in types:
                            country = comp.get("long_name")
                        if "postal_code" in types:
                            postal = comp.get("long_name")

                    return GoogleMapsData(
                        formatted_address=result.get("formatted_address"),
                        latitude=location.get("lat"),
                        longitude=location.get("lng"),
                        place_id=result.get("place_id"),
                        location_type=loc_type,
                        nearest_landmark=landmark if landmark else None,
                        city=city,
                        state=state,
                        country=country,
                        postal_code=postal
                    )
            except httpx.HTTPError as e:
                logger.error(f"Google Maps HTTP Error: {str(e)}")
    return None

async def fetch_nearby_pois(lat: float, lng: float, radius: int) -> list[dict]:
    if not settings.google_maps_api_key:
        return []
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "key": settings.google_maps_api_key
    }
    pois = []
    async with httpx.AsyncClient(timeout=5.0) as http_client:
        try:
            response = await http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "OK" and data.get("results"):
                for place in data["results"][:10]:
                    types = place.get("types", [])
                    if "locality" not in types and "political" not in types:
                        pois.append({
                            "name": place.get("name"),
                            "types": types,
                            "vicinity": place.get("vicinity")
                        })
        except httpx.HTTPError as e:
            logger.error(f"Places API Error: {str(e)}")
    return pois

async def resolve_address(input_text: str, enable_enrichment: bool = True, radius: int = 100) -> ParseResponse:
    key = cache_key(f"global_v12_{input_text.strip().lower()}_{enable_enrichment}_{radius}")
    cached = await cache_get(key)
    if cached:
        logger.info(f"Source: In-Memory Cache | Address: {input_text}")
        cached["source"] = "In-Memory Cache"
        return ParseResponse(**cached)

    confidence = 95.0
    llm_data = await parse_with_gemini(input_text)
    
    if llm_data and any(llm_data.values()):
        source_engine = "Gemini 2.5 Flash"
    else:
        llm_data = fallback_regex_parser(input_text)
        confidence = 65.0 
        source_engine = "Local Regex Fallback"
    
    base_parts = [
        llm_data.get("house_number"),
        llm_data.get("plot_number"),
        llm_data.get("street"),
        llm_data.get("block"),
        llm_data.get("phase"),
        llm_data.get("area"),
        llm_data.get("city"),
        llm_data.get("state"),
        llm_data.get("postal_code"),
        llm_data.get("country")
    ]
    
    clean_base = [str(part) for part in base_parts if part and part.lower() != "null"]
    base_address_string = ", ".join(clean_base)
    
    gmaps_data = await fetch_google_maps_data(
        address=base_address_string, 
        landmark=llm_data.get("landmark")
    )
    
    if gmaps_data:
        source_engine += " + Geocoding API"
        
        if not llm_data.get("city") and gmaps_data.city: llm_data["city"] = gmaps_data.city
        if not llm_data.get("state") and gmaps_data.state: llm_data["state"] = gmaps_data.state
        if not llm_data.get("country") and gmaps_data.country: llm_data["country"] = gmaps_data.country
        if not llm_data.get("postal_code") and gmaps_data.postal_code: llm_data["postal_code"] = gmaps_data.postal_code

        if enable_enrichment and not llm_data.get("landmark") and gmaps_data.latitude and gmaps_data.longitude:
            raw_pois = await fetch_nearby_pois(gmaps_data.latitude, gmaps_data.longitude, radius=radius)
            if raw_pois:
                poi_names = [p['name'] for p in raw_pois]
                logger.info(f"Places API Found {len(raw_pois)} POIs: {', '.join(poi_names)}")
                
                best_poi_name = await rank_best_landmark_with_gemini(raw_pois, base_address_string)
                if best_poi_name:
                    llm_data["landmark"] = f"Near {best_poi_name}"
                    gmaps_data.nearest_landmark = f"Near {best_poi_name}"
                    gmaps_data.enriched_by_places_api = True
                    source_engine += " + Places API & LLM Ranking"
                    logger.info(f"Gemini Selected Best POI: {best_poi_name}")
                else:
                    logger.info("Gemini rejected all fetched POIs.")
    
    full_parts = [
        llm_data.get("house_number"),
        llm_data.get("plot_number"),
        llm_data.get("street"),
        llm_data.get("block"),
        llm_data.get("phase"),
        llm_data.get("landmark"),
        llm_data.get("area"),
        llm_data.get("city"),
        llm_data.get("state"),
        llm_data.get("postal_code"),
        llm_data.get("country")
    ]
    
    clean_full = [str(part) for part in full_parts if part and part.lower() != "null"]
    normalized_string = ", ".join(clean_full)
    
    structured_data = StructuredAddress(
        house_number=llm_data.get("house_number"),
        plot_number=llm_data.get("plot_number"),
        street=llm_data.get("street"),
        block=llm_data.get("block"),
        phase=llm_data.get("phase"),
        landmark=llm_data.get("landmark"),
        area=llm_data.get("area"),
        city=llm_data.get("city"),
        state=llm_data.get("state"),
        postal_code=llm_data.get("postal_code"),
        country=llm_data.get("country"),
        normalized_address=normalized_string,
        confidence=confidence,
        google_maps_data=gmaps_data
    )
    
    response_obj = ParseResponse(
        original=input_text,
        normalized_input=normalized_string,
        structured=structured_data,
        source=source_engine
    )

    if "Fallback" not in source_engine:
        await cache_set(key, response_obj.model_dump())

    return response_obj

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/address/parse", response_model=ParseResponse)
async def api_parse_address(payload: AddressQuery):
    return await resolve_address(
        input_text=payload.address,
        enable_enrichment=payload.enable_landmark_enrichment,
        radius=payload.search_radius
    )

@app.post("/api/address/bulk")
async def api_bulk_address(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.pdf')):
        raise HTTPException(status_code=400, detail="Only .csv and .pdf files are supported")
    return {"message": "Bulk processing endpoint ready for implementation", "filename": file.filename}