import express from 'express'
import { customerRateLimit } from '../ratelimiters/customerateLimit'
import { getMessagesForCustomer } from '../controllers/customerController'

const customerRoutes = express.Router()

customerRoutes.post('/messages', customerRateLimit, getMessagesForCustomer)
customerRoutes.get('/conversation', getConversationForCustomer)


export default customerRoutes