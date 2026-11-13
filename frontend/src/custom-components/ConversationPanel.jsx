import { useRef } from "react";
import { api, formatDateTime, url } from "../api/api.js";
import { usePolling } from "../lib/usePolling.js";
import { useEffect } from "react";
import { DraftBox } from "./DraftBox.jsx";

export default function ConversationPanel({ id, onBack, onSignedOut, onChanged }) {
  const conv = usePolling(() => api.get(`${url}/api/agent/conversations/${id}`), 2500, [id]);
  const endRef = useRef(null);
  const count = conv.data?.messages.length ?? 0;

  useEffect(() => { if (conv.error?.status === 401) onSignedOut(); }, [conv.error, onSignedOut]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [count]);

  if (!conv.loaded) return <p className="empty">Loading…</p>;
  if (!conv.data) return <p className="notice error">{conv.error?.message}</p>;
  const { conversation, messages, draft } = conv.data;

  return (
    <div className="panel">
      <div className="panel-head">
        <button className="link back" onClick={onBack}>Back</button>
        <b>{conversation.customer_name}</b> <span className="muted">{conversation.customer_phone}</span>
      </div>
      {conv.error && <p className="notice error">{conv.error.message} Retrying…</p>}
      <div className="thread">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.sender === 'customer' ? 'theirs' : 'mine'}`}>
            {m.sender === 'agent' && <b>Agent reply</b>}
            <p>{m.text}</p>
            <time>{formatDateTime(m.created_at)}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <DraftBox draft={draft} onChanged={() => { conv.refresh(); onChanged(); }} />
    </div>
  );
}