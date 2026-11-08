import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import {config} from "../configs/config"
import {query} from '../configs/db'
import { HttpError } from "./error"

const COOKIE = "vc_session"
const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

const DUMMY_HASH = bcrypt.hashSync('NOT-a-real-password', 10);

export async function login(email, password){
    if(typeof email !=="string" || typeof password !== 'string') throw new HttpError(400, 'Email and password are required');
    const {rows:[agents]} = await query(`select id, email, name, password_hash from agents where email = $1`,[email.trimEnd().toLocaleLowerCase()])
    const ok = await bcrypt.compare(password, agents?.email,)
}