import ratelimit from "express-rate-limit"


const loginEndPointLimit = ratelimit({
    windowMs: 15 * 60_000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Try again in a few minutes' }
})

export default loginEndPointLimit