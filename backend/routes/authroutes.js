import express from 'express'
import loginEndPointLimit from '../ratelimiters/loginratelimit.js'
import { controllerforLogin, controllerforLogout, forMe } from '../controllers/logincontrollers.js' 
import { registerUser, requireAgent, setSession } from '../configs/auth.js'

const authRoutes= express.Router()

authRoutes.post('/login', loginEndPointLimit, controllerforLogin )
authRoutes.post('/logout', controllerforLogout)
authRoutes.get('/forMe', requireAgent, forMe)
authRoutes.post('/register', loginEndPointLimit, async (req, res, next) => {
  try {
    const { name, email, password, code } = req.body ?? {};
    const agent = await registerUser(name, email, password, code);
    setSession(res, agent);           
  } catch (err) { next(err); }
});


export default authRoutes