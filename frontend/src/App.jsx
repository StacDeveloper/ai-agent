import { useEffect } from "react";
import { useState } from "react";
import { api } from "./api/api";
import CustomerView from '../src/page-components/CustmerView.jsx'
export default function App() {
  const [view, setView] = useState('customer')
  const [agent, setAgent] = useState(undefined)

  const url = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

  useEffect(() => {
    api.get(`${url}/api/auth/forMe`).then((res) => setAgent(res.agent)).catch(() => setAgent(null))
  }, [])

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