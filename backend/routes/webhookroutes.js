import express from 'express'

const webhookRouter = express.Router()

webhookRouter.post('/homeRoute', express.raw({ type: '*/*', limit: '100kb' }), controllerForWebHookHomeRoute)



export default webhookRouter