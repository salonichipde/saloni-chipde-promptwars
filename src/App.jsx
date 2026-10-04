import { useState } from 'react';
import { analyzeDecision } from './api.js';
import DecisionForm from './components/DecisionForm.jsx';
import Results from './components/Results.jsx';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | error | done
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  async function handleSubmit(payload) {
    setStatus('loading');
    setError('');
    try {
      setData(await analyzeDecision(payload));
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Blind<span>Spot</span></h1>
        <p>See what you might be overlooking. BlindSpot never tells you what to choose — that stays with you.</p>
      </header>

      <DecisionForm onSubmit={handleSubmit} loading={status === 'loading'} />

      {status === 'loading' && <div className="state" role="status"><div className="spinner" />Examining your reasoning…</div>}
      {status === 'error' && <div className="state error" role="alert">{error}</div>}
      {status === 'done' && <Results data={data.analysis} mock={data.mock} />}
    </main>
  );
}
