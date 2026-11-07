export function log(level, msg, fields = {}) {
    const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...fields })
    return (level === "error" ? console.error : console.log)(line);
}