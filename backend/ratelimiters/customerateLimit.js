import {rateLimit} from 'express-rate-limit'

export const customerRateLimit = rateLimit({
    windowMs:60_000,
    limit:20,
    standardHeaders:true,
    legacyHeaders:false,
    message:{error:'Too many messages. Wait a minute and try again.'}
}) 

