import { clearSession, login, setSession } from "../configs/auth.js"

export const controllerforLogin = async (req, res, next) => {
    try {
        const agent = await login(req.body?.email, req.body?.password)
        setSession(res, agent)
        res.json({ success: true, agent })
    } catch (error) {
        next(error)
        return { success: false, message: `Login error ${error?.response?.message || error}` }
    }
}

export const controllerforLogout = async (req, res) => {
    clearSession(res)
    res.json({ success: true, message: 'Signed Out' })
}

export const forMe = (req, res) => res.json({ success: true, agent: req.agent })