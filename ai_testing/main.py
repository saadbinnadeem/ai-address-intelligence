from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import json
import re
import os
import en_core_web_sm

# Use this to load the base model
nlp_base = en_core_web_sm.load()

# Or use the string name if you prefer
# nlp_base = spacy.load("en_core_web_sm")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "saved_address_model"

try:
    nlp_model = spacy.load(MODEL_DIR)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_DIR}.")

CITY_PROVINCE_MAP = {
    "karachi": "Sindh", "lahore": "Punjab", "peshawar": "KPK",
    "quetta": "Balochistan", "islamabad": "Federal Territory",
    "hyderabad": "Sindh", "multan": "Punjab", "faisalabad": "Punjab"
}

TOWN_CITY_MAP = {
    "malir": "karachi", "baldia": "karachi", "bin qasim": "karachi", "gadap": "karachi",
    "gulshan-e-iqbal": "karachi", "jamshed": "karachi", "kemari": "karachi", "korangi": "karachi",
    "landhi": "karachi", "liaquatabad": "karachi", "lyari": "karachi", "new karachi": "karachi",
    "north karachi": "karachi", "north nazimabad": "karachi", "orangi": "karachi", "saddar": "karachi",
    "shah faisal": "karachi", "site town": "karachi", "surjani": "karachi", "falaknaz": "karachi",
    "bahria town karachi": "karachi", "ravi town": "lahore", "shalimar": "lahore", "wagah": "lahore",
    "aziz bhatti": "lahore", "data ganj bakhsh": "lahore", "samanabad": "lahore", "iqbal town": "lahore",
    "nishtar": "lahore", "bahria town lahore": "lahore"
}

DIRECT_REPLACE_MAP = {
    "makan num": "House No", "makkan no": "House No", "makan no": "House No",
    "flat no": "Flat No", "block no": "Block", "building no": "Building",
    "gli": "Street", "gali": "Street", "wali": ""
}

POSITIONAL_MAP = {
    "ke piche wali gli me": "Street Behind", "ke piche wali gali me": "Street Behind",
    "ke peeche wali gli me": "Street Behind", "ke peeche wali gali me": "Street Behind",
    "ke samne wali gli me": "Street Opposite", "ke samne wali gali me": "Street Opposite",
    "ke baghal wali gli me": "Street Adjacent To", "ke baghal wali gali me": "Street Adjacent To",
    "ke pass": "Near", "ke samne": "Opposite", "ke peeche": "Behind", "ke piche": "Behind",
    "ke baghal me": "Adjacent To", "ke baraber me": "Adjacent To", "ke barabar me": "Adjacent To",
    "ki back side pe": "Behind"
}

FORMAT_ORDER = ["BUILDING", "UNIT", "BLOCK", "STREET", "SOCIETY", "AREA", "TOWN", "LANDMARK", "CITY", "PROVINCE"]

class AddressRequest(BaseModel):
    address: str

def clean_input_text(text: str) -> str:
    return re.sub(r'[^\w\s/]', ' ', text).strip()

def normalize_term(text: str) -> str:
    normalized = text.lower()
    for urdu, eng in POSITIONAL_MAP.items():
        if urdu in normalized:
            cleaned_base = normalized.replace(urdu, "").strip()
            normalized = f"{eng.lower()} {cleaned_base}"
            break 
    for urdu, eng in DIRECT_REPLACE_MAP.items():
        if urdu in normalized:
            normalized = normalized.replace(urdu, eng.lower())
    return " ".join(normalized.split()).title()

@app.post("/parse")
async def parse_address(request: AddressRequest):
    if not request.address.strip():
        raise HTTPException(status_code=400, detail="Address cannot be empty")
        
    cleaned_text = clean_input_text(request.address)
    doc = nlp_model(cleaned_text)
    
    extracted = {}
    mapped_chars = 0
    
    for ent in doc.ents:
        extracted[ent.label_] = ent.text
        mapped_chars += len(ent.text.replace(" ", ""))
        
    if "CITY" not in extracted:
        check_string = (extracted.get("TOWN", "") + " " + extracted.get("SOCIETY", "")).lower()
        for town_key, city_val in TOWN_CITY_MAP.items():
            if town_key in check_string:
                extracted["CITY"] = city_val
                break
                
    city_name = extracted.get("CITY", "").lower()
    if city_name in CITY_PROVINCE_MAP:
        extracted["PROVINCE"] = CITY_PROVINCE_MAP[city_name]
        
    total_chars = len(cleaned_text.replace(" ", ""))
    success_ratio = round((mapped_chars / total_chars) * 100) if total_chars > 0 else 0
    
    formatted_parts = []
    for key in FORMAT_ORDER:
        if key in extracted:
            formatted_parts.append(normalize_term(extracted[key]))
            
    formatted_string = ", ".join(formatted_parts)
    
    return {
        "original_text": request.address,
        "success_ratio": f"{success_ratio}%",
        "formatted_address": formatted_string,
        "structured_address": extracted
    }