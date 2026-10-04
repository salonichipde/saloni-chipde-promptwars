import 'dotenv/config';
import express from 'express';
import { analyze } from './gemini.js';

const app = express();
app.use(express.json({ limit: '50kb' }));

const MAX = { decision: 300, context: 3000, leaning: 500, option: 200 };

function validate(body = {}) {
  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const decision = clean(body.decision);
  const context = clean(body.context);
  const leaning = clean(body.leaning);
  const options = (Array.isArray(body.options) ? body.options : []).map(clean).filter(Boolean);

  if (!decision) return { error: 'Please describe the decision you are facing.' };
  if (!context) return { error: 'Please add some context about your situation.' };
  if (options.length < 2) return { error: 'Please list at least two options.' };
  if (!leaning) return { error: 'Please say what you are currently leaning toward.' };
  if (decision.length > MAX.decision || context.length > MAX.context || leaning.length > MAX.leaning ||
      options.some((o) => o.length > MAX.option) || options.length > 6)
    return { error: 'Input is too long (max 6 options).' };
  return { value: { decision, context, options, leaning } };
}

app.post('/api/analyze', async (req, res) => {
  const { error, value } = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    res.json(await analyze(value));
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: 'The analysis service had a problem. Please try again.' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`BlindSpot API on :${port} (${process.env.GEMINI_API_KEY ? 'Gemini' : 'MOCK mode – set GEMINI_API_KEY'})`)
);
