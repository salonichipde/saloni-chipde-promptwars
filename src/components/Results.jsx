const YOU = { label: 'From you', cls: 'tag-you' };
const AI = { label: 'Possibility, not fact', cls: 'tag-ai' };

function Section({ title, icon, tag = AI, items, children }) {
  if (!items?.length) return null;
  return (
    <section className="card section">
      <div className="section-head">
        <h2><span aria-hidden>{icon}</span> {title}</h2>
        <span className={`tag ${tag.cls}`}>{tag.label}</span>
      </div>
      <ul>{items.map((item, i) => <li key={i}>{children(item)}</li>)}</ul>
    </section>
  );
}

const Row = ({ main, sub, label }) => (
  <>
    <strong>{main}</strong>
    {sub && <p>{label && <em>{label} </em>}{sub}</p>}
  </>
);

export default function Results({ data, mock }) {
  return (
    <div className="results">
      {mock && <div className="state notice">Demo mode: sample output. Add GEMINI_API_KEY on the server for real analysis.</div>}
      <p className="disclaimer">These are prompts for your thinking, not advice. BlindSpot does not recommend an option — the decision is yours.</p>

      <Section title="What you told us" icon="📌" tag={YOU} items={data.known_facts}>{(f) => <strong>{f}</strong>}</Section>
      <Section title="Hidden assumptions" icon="🧩" items={data.assumptions}>
        {(a) => <Row main={a.text} sub={a.why_it_matters} label="Why it matters:" />}
      </Section>
      <Section title="Potential risks" icon="⚠️" items={data.risks}>
        {(r) => <Row main={<>{r.text} {r.likelihood && <span className={`pill ${r.likelihood}`}>{r.likelihood}</span>}</>} sub={r.affects} label="Affects:" />}
      </Section>
      <Section title="Missing information" icon="🔍" items={data.missing_information}>
        {(m) => <Row main={m.text} sub={m.how_to_find_out} label="Find out:" />}
      </Section>
      <Section title="Alternative perspectives" icon="👁️" items={data.alternative_perspectives}>
        {(p) => <Row main={p.viewpoint} sub={p.insight} />}
      </Section>
      <Section title="Possible cognitive biases" icon="🧠" items={data.cognitive_biases}>
        {(b) => <Row main={b.name} sub={b.how_it_may_show_up} />}
      </Section>
      <Section title="Trade-offs" icon="⚖️" items={data.tradeoffs}>
        {(t) => <><strong>{t.option}</strong><p><em>Gains:</em> {t.gains}</p><p><em>Costs:</em> {t.costs}</p></>}
      </Section>
      <Section title="Questions to reflect on" icon="💭" items={data.reflection_questions}>{(q) => q}</Section>
      <Section title="What could change your thinking" icon="🔄" items={data.could_change_your_mind}>{(c) => c}</Section>
    </div>
  );
}
