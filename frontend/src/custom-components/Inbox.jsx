import { useEffect } from "react";
import { usePolling } from "../lib/usePolling.js";
import { useState } from "react";
import StatusTag from '../custom-components/Stautstag.jsx'
import { api, url, formatDateTime } from '../api/api.js'
import ConversationPanel from "./ConversationPanel.jsx";

export default function Inbox({ agent, onSignedOut }) {
  const [selected, setSelected] = useState(null);
  const list = usePolling(() => api.get('/api/agent/conversations'), 4000);
  console.log(list)
  // A 401 from any poll means the session expired.
  useEffect(() => { if (list.error?.status === 401) onSignedOut(); }, [list.error, onSignedOut]);

  async function signOut() {
    await api.post(`${url}/api/auth/logout`).catch(() => { });
    onSignedOut();
  }

  const conversations = list.data?.conversation ?? [];
  console.log(conversations)
  return (
    <div className={`inbox ${selected ? 'has-selection' : ''}`}>
      <aside className="list">
        <div className="list-head">
          <span>{agent.name}</span>
          <button className="link" onClick={signOut}>Sign out</button>
        </div>
        {list.error && list.error.status !== 401 && <p className="notice error">{list.error.message} Retrying…</p>}
        {list.loaded && !conversations.length && !list.error && <p className="empty">No conversations yet. Send a message from the Customer view.</p>}
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button className={`conv ${selected === c.id ? 'active' : ''}`} onClick={() => setSelected(c.id)}>
                <span className="conv-top"><b>{c.customer_name}</b><time>{formatDateTime(c.last_message_at)}</time></span>
                <span className="preview">{c.last_sender === 'agent' ? 'You: ' : ''}{c.preview}</span>
                <StatusTag c={c} />
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="detail">
        {selected
          ? <ConversationPanel key={selected} id={selected} onBack={() => setSelected(null)} onSignedOut={onSignedOut} onChanged={list.refresh} />
          : <p className="empty">Select a conversation.</p>}
      </section>
    </div>
  );
}