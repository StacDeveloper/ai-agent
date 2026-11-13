import { useEffect } from "react";
import { useState } from "react";
import { api } from "./api/api";
import CustomerView from '../src/page-components/CustmerView.jsx'
import AgentView from '../src/page-components/AgentView.jsx'


export default function App() {
  const [view, setView] = useState('customer')
  const [agent, setAgent] = useState(undefined)

  const url = import.meta.env.VITE_BASE_URL


  useEffect(() => {
    if (!url) { setAgent(null); return; }
    console.log('VITE_BASE_URL =', import.meta.env.VITE_BASE_URL);
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`${url}/api/auth/forMe`);
        if (!cancelled) setAgent(res.agent);
      } catch {
        if (!cancelled) setAgent(null);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Verdant &amp; Co <span>Support</span></div>
        <div className="toggle" role="group" aria-label="Switch view">
          {['customer', 'agent'].map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
              {v === 'customer' ? 'Customer view' : 'Agent view'}
            </button>
          ))}
        </div>
      </header>
      <main>
        {view === 'customer' ? (
          <CustomerView />
        ) : (
          <AgentView agent={agent} onSignedIn={setAgent} onSignedOut={() => setAgent(null)} />
        )}
      </main>
    </div>
  );

}