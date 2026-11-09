import express from 'express'
import loginEndPointLimit from '../middleware/ratelimit'
import { controllerforLogin, controllerforLogout, forMe } from '../controllers/controllers'
import { requireAgent } from '../configs/auth'

const authRoutes= express.Router()

authRoutes.post('/login', loginEndPointLimit, controllerforLogin )
authRoutes.post('/logout', controllerforLogout)
authRoutes.get('/forMe', requireAgent, forMe)


export default authRoutes