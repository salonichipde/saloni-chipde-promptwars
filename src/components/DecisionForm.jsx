import { useState } from 'react';

const empty = { decision: '', context: '', options: '', leaning: '' };

export default function DecisionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const options = form.options.split('\n').map((o) => o.trim()).filter(Boolean);
    if (!form.decision.trim()) return setError('Describe the decision you are facing.');
    if (!form.context.trim()) return setError('Add some context about your situation.');
    if (options.length < 2) return setError('List at least two options, one per line.');
    if (!form.leaning.trim()) return setError('Tell us what you are leaning toward right now.');
    setError('');
    onSubmit({ ...form, options });
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <label>The decision you're facing
        <input value={form.decision} onChange={set('decision')} maxLength={300} placeholder="e.g. Should I accept the job offer in another city?" />
      </label>
      <label>Your situation & context
        <textarea rows={4} value={form.context} onChange={set('context')} maxLength={3000} placeholder="Facts about your situation, constraints, timeline, what matters to you…" />
      </label>
      <label>Options you're considering <small>(one per line)</small>
        <textarea rows={3} value={form.options} onChange={set('options')} placeholder={'Accept the offer\nStay in my current role'} />
      </label>
      <label>What you're leaning toward right now
        <input value={form.leaning} onChange={set('leaning')} maxLength={500} placeholder="Be honest — and why, if you know" />
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Find My Blind Spots'}</button>
    </form>
  );
}
