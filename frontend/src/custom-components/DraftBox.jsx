import { useRef } from "react";
import { useState } from "react";
import { api, url } from "../src/api/api";
import { useEffect } from "react";

export function DraftBox({ draft, onChanged }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dirty = useRef(false); // true once the agent has typed, so a late AI draft never overwrites their text
  const lastId = useRef(null);

    

  useEffect(() => {
    if (draft?.id !== lastId.current) {
      lastId.current = draft?.id ?? null;
      dirty.current = false;
      setText(draft?.text ?? '');
      setError('');
    } else if (!dirty.current && draft?.text != null) {
      setText(draft.text);
    }
  }, [draft?.id, draft?.text, draft?.updated_at]);

  if (!draft || draft.status === 'used') {
    return <p className="notice">The latest customer message has been answered. A new draft appears when the customer writes again.</p>;
  }

  async function act(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const approve = () => act(() => api.post(`${url}/api/agent/drafts/${draft.id}/approve`, { text }));
  const regenerate = () => {
    if (dirty.current && !window.confirm('Replace your edits with a new AI draft?')) return;
    dirty.current = false;
    return act(() => api.post(`${url}/api/agent/drafts/${draft.id}/regenerate`));
  };

  const waiting = draft.status === 'pending' || draft.status === 'generating';
  return (
    <div className="draft">
      <div className="draft-head">
        <b>AI draft</b>
        {waiting && <span className="muted">Drafting a reply…</span>}
        {draft.status === 'failed' && <span className="tag bad">Draft unavailable</span>}
        {draft.needs_human && <span className="tag warn">Needs human review</span>}
      </div>
      {draft.status === 'failed' && (
        <p className="notice error">The AI could not draft a reply ({draft.error}). Write your own below or regenerate.</p>
      )}
      {draft.needs_human && draft.reason && <p className="notice warn">{draft.reason}</p>}
      <textarea
        rows={5}
        value={text}
        maxLength={2000}
        placeholder={waiting ? 'The draft will appear here. You can also write your own reply.' : 'Write a reply'}
        onChange={(e) => { dirty.current = true; setText(e.target.value); }}
      />
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="row end">
        {(draft.status === 'failed' || draft.status === 'ready') && (
          <button onClick={regenerate} disabled={busy}>Regenerate draft</button>
        )}
        <button className="primary" onClick={approve} disabled={busy || !text.trim()}>
          {busy ? 'Saving…' : 'Approve reply'}
        </button>
      </div>
    </div>
  );
}