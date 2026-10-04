# BlindSpot
AI thinking companion that surfaces assumptions, risks and blind spots — never the decision.

## Run
    npm install
    cp .env.example .env     # add GEMINI_API_KEY (optional – runs in mock mode without it)
    npm run dev              # client :5173, API :3001

## Architecture
- `src/` React UI (`components/DecisionForm`, `components/Results`), `api.js` calls `/api/analyze`
- `server/index.js` Express: input validation + route
- `server/gemini.js` prompt, Gemini call, output normalisation, mock fallback
- The Gemini key exists only in server env; the browser never sees it.
