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
## Live Demo

https://YOUR-VERCEL-LINK.vercel.app

## Google AI Usage

BlindSpot uses the Google Gemini API on the server side to analyze a user's decision context and identify assumptions, risks, missing information, alternative perspectives, and possible cognitive biases.

The AI does not choose or rank an option. It helps the user think more critically before making their own decision.

## Security

- Gemini API key is stored only in server-side environment variables.
- API keys are never exposed to the frontend.
- User inputs are validated and length-limited.
- `.env` is excluded from Git.
