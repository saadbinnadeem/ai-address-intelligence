# AI Address Parsing Platform

## Overview

A global, high-accuracy address parsing and normalization engine designed for real-world, noisy inputs.

Supports:

* Abbreviation expansion (e.g. `malr → malir`)
* Roman Urdu / Hindi normalization
* Fuzzy correction of misspellings
* Human-readable structured hierarchy
* Real-world geocoding validation
* Confidence scoring
* Bulk file processing (CSV, PDF)

---

## Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### Backend

* FastAPI (Python)

### Core Engine

* Geocoding: Google Maps + OpenStreetMap (Nominatim)
* Fuzzy Matching: rapidfuzz
* Caching: Redis
* HTTP Client: httpx

---

## Architecture

### Multi-Stage Pipeline

1. Input Normalization

   * Roman Urdu/Hindi → English
   * Abbreviation expansion
   * Token cleanup

2. Fuzzy Matching

   * Corrects typos and short forms
   * Example: `jnah → jinnah`

3. Multi-Geocoder Resolution

   * Primary: Google Maps
   * Secondary: OpenStreetMap fallback

4. Scoring Engine

   * Token similarity scoring
   * Best candidate selection

5. Caching Layer

   * Redis-based caching (24h TTL)

6. Structured Output

   * Area → City → State → Country
   * Normalized address string
   * Confidence score

---

## Project Structure

```
root/
├── ai_testing/        # FastAPI backend
├── address-ui/        # Next.js frontend
└── README.md
```

---

## Backend Setup (`ai_testing`)

```bash
cd ai_testing
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn httpx redis rapidfuzz python-dotenv pypdf
```

---

## Environment Variables

Create `.env` inside `ai_testing`:

```
GOOGLE_MAPS_API_KEY=your_google_maps_key
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
```

---

## Redis Setup

### Option 1: Docker (Recommended)

```bash
docker run -d -p 6379:6379 redis
```

### Option 2: Local Install (Mac)

```bash
brew install redis
brew services start redis
```

---

## Run Backend

```bash
uvicorn main:app --host 0.0.0.0 --port 4000 --reload
```

---

## Frontend Setup (`address-ui`)

```bash
cd address-ui
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev
```

---

## API Endpoints

### 1. Parse Single Address

```
POST /api/address/parse
```

#### Request

```json
{
  "address": "malr piche jinnah square khi"
}
```

#### Response

```json
{
  "original": "malr piche jinnah square khi",
  "normalized_input": "malir behind jinnah square karachi",
  "structured": {
    "area": "Malir",
    "city": "Karachi",
    "state": "Sindh",
    "country": "Pakistan",
    "normalized_address": "Jinnah Square, Malir, Karachi, Sindh, Pakistan",
    "confidence": 96.2
  }
}
```

---

### 2. Bulk Address Parsing

```
POST /api/address/bulk
```

* Content-Type: multipart/form-data
* Field: `file`
* Supported: `.csv`, `.pdf`

---

### 3. Health Check

```
GET /health
```

---

## How to Test

### Using cURL

```bash
curl -X POST http://localhost:4000/api/address/parse \
  -H "Content-Type: application/json" \
  -d '{"address":"malr piche jinnah sq khi"}'
```

---

### Using Postman

* Method: POST
* URL: http://localhost:4000/api/address/parse
* Body → JSON:

```json
{
  "address": "malr piche jinnah sq khi"
}
```

---

## Example Processing Flow

Input:

```
malr piche jinnah sq khi
```

Pipeline:

```
→ normalize → malir behind jinnah square karachi
→ fuzzy match → correct tokens
→ geocode (Google)
→ fallback (OSM if needed)
→ score results
→ return best match
→ cache response
```

---

## Accuracy Strategy

* Deterministic normalization first
* Real-world geocoding as source of truth
* Fuzzy matching for noisy inputs
* Confidence scoring to avoid incorrect outputs
* Redis caching for consistency and performance

---

## Performance Notes

* Redis significantly reduces API calls
* Cached responses return instantly
* Average response time:

  * Cached: ~5–20ms
  * Fresh: ~300–900ms

---

## Troubleshooting

### No Results

* Check Google Maps API key
* Ensure Geocoding API is enabled

### Slow Response

* Redis not running
* Network latency to geocoding APIs

### Incorrect Normalization

* Extend `ROMAN_DICT`
* Add terms to `GLOBAL_TERMS`
* Adjust fuzzy threshold (default: 85)

---

## Future Enhancements

* Autocomplete API (`/suggest`)
* Lat/Lng support + map preview
* Country detection and biasing
* Offline dataset fallback
* Vector search + embeddings
* Multi-language expansion

---

## Summary

This system is designed to handle:

* Messy real-world addresses
* Roman Urdu / Hindi input
* Global address formats

It combines deterministic logic, fuzzy matching, and real-world geocoding to achieve high accuracy with predictable behavior.
