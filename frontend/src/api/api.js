export class ApiError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
    }
}

async function request(method, url, body) {
    let res;
    try {
        res = await fetch(url, {
            method,
            credentials: 'same-origin',
            headers: body ? { 'Content-type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined
        })
    } catch (error) {
        throw new ApiError(0, 'Cannot react the backend server. Check your connection.')
    }

    const data = await res.json().catch(() => ({}))
    if (!res.success) throw new ApiError(res.status, data.error || `Request failed (${res.status})`)
    return data
}

export const api = {
    get: (url) => request('GET', url),
    post: (url, body = {}) => request('POST', url, body)
}

const timeFmt = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat([], { day: 'numeric', month: 'short' })

export function formatDateTime(iso) {
    const date = new Date(iso)
    return date.toDateString() === new Date().toDateString() ? timeFmt.format(date) : `${dateFmt.format(date)}, ${timeFmt.format(date)}`;
}

export const url = import.meta.env.VITE_BASE_URL