export default function StatusTag({ c }) {
  if (!c.awaiting_reply) return <span className="tag done">Replied</span>;
  if (c.draft_status === 'failed') return <span className="tag bad">Draft failed</span>;
  if (c.needs_human) return <span className="tag warn">Needs human review</span>;
  if (c.draft_status === 'ready') return <span className="tag ok">Draft ready</span>;
  return <span className="tag">Drafting…</span>;
}