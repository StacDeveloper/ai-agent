import express from 'express'
import { customerRateLimit } from '../ratelimiters/customerateLimit.js'
import { getConversationForCustomer, getMessagesForCustomer } from '../controllers/customerController.js'

const customerRoutes = express.Router()

customerRoutes.post('/messages', customerRateLimit, getMessagesForCustomer)
customerRoutes.get('/conversation', getConversationForCustomer)


export default customerRoutes