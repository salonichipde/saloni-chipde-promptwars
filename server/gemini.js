// All AI logic lives here. The API key is read from the server environment only.
const SYSTEM_PROMPT = `You are BlindSpot, a thinking companion that helps people examine their reasoning.
HARD RULES:
- NEVER recommend, rank, or hint at which option the user should choose. No "you should", "the best option", "I'd go with".
- Stay neutral. Present considerations for every option, including the one the user leans toward.
- Separate what the user actually stated ("known_facts") from things you infer or speculate. Everything outside known_facts is a possibility, not a fact.
- Be specific to this situation, not generic. Be concise (1-2 sentences per item).
Respond with ONLY valid JSON in exactly this shape:
{
 "known_facts": [string],
 "assumptions": [{"text": string, "why_it_matters": string}],
 "risks": [{"text": string, "likelihood": "low"|"medium"|"high", "affects": string}],
 "missing_information": [{"text": string, "how_to_find_out": string}],
 "alternative_perspectives": [{"viewpoint": string, "insight": string}],
 "cognitive_biases": [{"name": string, "how_it_may_show_up": string}],
 "tradeoffs": [{"option": string, "gains": string, "costs": string}],
 "reflection_questions": [string],
 "could_change_your_mind": [string]
}`;

const arr = (v) => (Array.isArray(v) ? v : []);
const str = (v) => (typeof v === 'string' ? v : '');

// Defensive normalisation: guarantees the UI always receives the expected shape.
function normalize(raw) {
  const mapList = (list, keys) =>
    arr(list).map((i) => Object.fromEntries(keys.map((k) => [k, str(i?.[k])])));
  return {
    known_facts: arr(raw.known_facts).map(str).filter(Boolean),
    assumptions: mapList(raw.assumptions, ['text', 'why_it_matters']),
    risks: mapList(raw.risks, ['text', 'likelihood', 'affects']),
    missing_information: mapList(raw.missing_information, ['text', 'how_to_find_out']),
    alternative_perspectives: mapList(raw.alternative_perspectives, ['viewpoint', 'insight']),
    cognitive_biases: mapList(raw.cognitive_biases, ['name', 'how_it_may_show_up']),
    tradeoffs: mapList(raw.tradeoffs, ['option', 'gains', 'costs']),
    reflection_questions: arr(raw.reflection_questions).map(str).filter(Boolean),
    could_change_your_mind: arr(raw.could_change_your_mind).map(str).filter(Boolean),
  };
}

function buildUserPrompt({ decision, context, options, leaning }) {
  return `DECISION: ${decision}
CONTEXT: ${context}
OPTIONS:\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}
CURRENTLY LEANING TOWARD: ${leaning}`;
}

async function callGemini(input) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(input) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      }),
    }
  );
 if (!res.ok) {
  const errorText = await res.text();
  console.log("GEMINI ERROR:", errorText);

  if (res.status === 503) {
    throw new Error("Gemini is temporarily busy. Please try again.");
  }

  throw new Error(`Gemini request failed (${res.status})`);
}

const data = await res.json();
}

// Used when no GEMINI_API_KEY is set, so the UI is demo-able immediately.
function mockAnalysis({ decision, options, leaning }) {
  return normalize({
    known_facts: [`You are deciding: ${decision}`, `You are considering ${options.length} options`, `You are currently leaning toward: ${leaning}`],
    assumptions: [{ text: 'The situation will stay roughly as it is today.', why_it_matters: 'Most plans quietly depend on conditions that may change.' }],
    risks: [{ text: 'Your preferred option may have downsides you have not yet looked for.', likelihood: 'medium', affects: leaning }],
    missing_information: [{ text: 'Direct experience from people who chose each option.', how_to_find_out: 'Talk to two people who made a similar choice.' }],
    alternative_perspectives: [{ viewpoint: 'You, five years from now', insight: 'Which choice would you want to have made, regardless of how it feels today?' }],
    cognitive_biases: [{ name: 'Anchoring', how_it_may_show_up: 'The first option you thought of may be shaping how you judge the others.' }],
    tradeoffs: options.map((o) => ({ option: o, gains: '(demo mode) what this option offers', costs: '(demo mode) what it asks of you' })),
    reflection_questions: ['What would make you regret each option?', 'What are you hoping not to find out?'],
    could_change_your_mind: ['Evidence that a key assumption above is wrong.'],
  });
}

export async function analyze(input) {
  if (!process.env.GEMINI_API_KEY) {
    return { mock: true, analysis: mockAnalysis(input) };
  }

  try {
    return { mock: false, analysis: await callGemini(input) };
  } catch (error) {
    console.log("Gemini unavailable, using demo fallback:", error.message);

    return {
      mock: true,
      analysis: mockAnalysis(input),
      fallback: true,
      message: "AI service is temporarily busy. Showing demo analysis."
    };
  }
}