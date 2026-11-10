import { HttpError } from "../configs/error.js"

export const MAX_TEXT = 2000;

export const cleanText = (value, field = "text") => {
    if (typeof value !== "string") throw new HttpError(400, `${field} must be a string`)
    const text = value.trim()
    if (!text) throw new HttpError(400, `${field} cannot be empty`)
    if (text.length > MAX_TEXT) throw new HttpError(400, `${field} is longer than ${MAX_TEXT} characters`)
    return text
}

export const cleanCustomer = (c) => {
    if (!c || typeof c !== "object") throw new HttpError(400, 'customer is required')
    const externalId = String(c.id ?? '')
    const name = typeof c.name === 'string' ? c.name.trim() : '';
    const phone = typeof c.phone === 'string' ? c.phone.trim() : '';
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(externalId)) throw new HttpError(400, 'customer.id is invalied')
    if (!name || name.length > 100) throw new HttpError(400, 'customer.name is required (max 100 characters)')
    if (!/^\+?[0-9 ()-]{6,20}$/.test(phone)) throw new HttpError(400, 'customer.phone is invalid')
    return { externalId, name, phone }
}