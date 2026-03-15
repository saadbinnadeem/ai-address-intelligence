# AI Address Parsing Platform

## Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- AI: Google Gemini (`gemini-1.5-flash`)
- File processing: CSV (`csv-parse`) and PDF (`pdf-parse`)

## Architecture
- Stateless request/response processing
- In-memory file handling
- No database and no persistent storage
- Real-time parsing via Gemini API

## Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Frontend setup
```bash
cd address-ui
npm install
npm run dev
```

Set frontend API URL:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## API
- `POST /api/address/parse`
- `POST /api/address/bulk` (multipart form field: `file`)
- `GET /health`
