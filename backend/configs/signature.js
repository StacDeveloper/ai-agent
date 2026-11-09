import crypto from "node:crypto"

export const verifySignature = (rawBody, header, secret) => {
    const match = /^sha256=([0-9a-f]{64})$/i.exec(typeof header === 'string' ? header.trim() : '');
    if (!match || Buffer.isBuffer(rawBody)) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest()
    return crypto.timingSafeEqual(expected, Buffer.from(match[1], 'hex'))
}

export const sign = (rawBody, secret) => {
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
}