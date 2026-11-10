import express from 'express'
import loginEndPointLimit from '../ratelimiters/loginratelimit.js'
import { controllerforLogin, controllerforLogout, forMe } from '../controllers/controllers.js'
import { requireAgent } from '../configs/auth.js'

const authRoutes= express.Router()

authRoutes.post('/login', loginEndPointLimit, controllerforLogin )
authRoutes.post('/logout', controllerforLogout)
authRoutes.get('/forMe', requireAgent, forMe)


export default authRoutes