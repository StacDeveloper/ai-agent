import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { config } from "../configs/config.js"
import { query } from '../configs/db.js'
import { HttpError } from "./error.js"
import crypto from 'node:crypto'
import 'dotenv/config'


const COOKIE = "vc_session"
const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

const DUMMY_HASH = bcrypt.hashSync('NOT-a-real-password', 10);

export async function login(email, password) {
    if (typeof email !== 'string' || typeof password !== 'string') {
        throw new HttpError(400, 'Email and password are required');
    }
    const { rows: [agent] } = await query(
        `select id, email, name, password_hash from agents where email = $1`,
        [email.trim().toLowerCase()],
    );

    const ok = await bcrypt.compare(password, agent?.password_hash ?? DUMMY_HASH);
    if (!agent || !ok) throw new HttpError(401, 'Incorrect email or password');
    return { id: agent.id, email: agent.email, name: agent.name };
}

export async function setSession(res, agent) {
    const token = await jwt.sign({ sub: agent.id, name: agent.name, email: agent.email }, config.jwtSecret, { expiresIn: '7d' })
    res.cookie(COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: SEVEN_DAYS_MS
    })
}

export const clearSession = (res) => res.clearCookie(COOKIE, { path: '/' })

export async function requireAgent(req, res, next) {
    console.log('cookies:', req.cookies, 'COOKIE name:', COOKIE);
    try {
        const token = req.cookies?.[COOKIE];
        if (!token) throw new HttpError(401, 'Sign in is required');
        const payload = jwt.verify(token, config.jwtSecret);
        req.agent = { id: payload.sub, name: payload.name, email: payload.email };
        next();
    } catch (error) {
        console.log('auth failed:', error.message);
        next(error instanceof HttpError ? error : new HttpError(401, 'Sign in is required'));
    }
}

export async function registerUser(name, email, password, code) {
    if ([!name, email, password, code].every((mandem) => typeof mandem !== 'string')) {
        throw new HttpError('400', 'Name, email, password and code should be of right characters')
    }
    name = name.trim()
    email = email.trim()
    if (!name || name.length > 100) throw new HttpError(400, 'Enter your name')
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Enter a valid email');
    if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters')

    console.log('set:', Boolean(process.env.AGENT_SIGNUP_CODE), 'env len:', process.env.AGENT_SIGNUP_CODE?.length, 'got len:', code?.length)
    const a = Buffer.from(code.trim())
    const b = Buffer.from(process.env.AGENT_SIGNUP_CODE || '')
    if (!b.length || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new HttpError(403, 'Invalid access code');
    }
    try {
        const { rows: [agent] } = await query(
            `insert into agents (email, name, password_hash) values ($1, $2, $3)
       returning id, email, name`,
            [email, name, await bcrypt.hash(password, 10)],
        );
        return agent;
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists');
        throw err;
    }

}