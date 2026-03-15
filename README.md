# AI Address Parsing Platform

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: FastAPI (Python) in `ai_testing`
- AI: Google Gemini (`gemini-1.5-flash`)
- File processing: in-memory CSV + PDF parsing

## Architecture
- Stateless request/response processing
- No database and no persistent storage
- In-memory bulk file handling
- Real-time parsing via Gemini API

## Backend setup (`ai_testing`)
```bash
cd ai_testing
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY=your_key
export CORS_ORIGIN=http://localhost:3000
uvicorn main:app --host 0.0.0.0 --port 4000
```

## Frontend setup (`address-ui`)
```bash
cd address-ui
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev
```

## API
- `POST /api/address/parse`
- `POST /api/address/bulk` (`multipart/form-data` with `file`)
- `GET /health`
