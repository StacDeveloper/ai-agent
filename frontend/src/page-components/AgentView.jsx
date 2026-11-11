import Login from '../custom-components/Login.jsx'
import Inbox from '../custom-components/Inbox.jsx'

export default function AgentView({ agent, onSignedIn, onSignedOut }) {
    if (agent === undefined) return <p className="empty">Loading...</p>
    if (agent === null) return <Login onSignedIn={onSignedIn} />
    return <Inbox agent={agent} onSignedOut={onSignedOut} />
}