import express from 'express'
import {controllerForWebHookHomeRoute} from '../controllers/webhookController.js'
const webhookRouter = express.Router()

webhookRouter.post('/homeRoute', express.raw({ type: '*/*', limit: '100kb' }), controllerForWebHookHomeRoute)



export default webhookRouter