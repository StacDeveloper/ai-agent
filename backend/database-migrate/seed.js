import brcrypt from 'bcryptjs'
import { pgpool } from '../configs/db.js'

const password = process.env.SEED_AGENT_PASSORD || 'verdant-agent-2026'
const hash = await brcrypt.hash(password, 10)
for (const [email, name] of [['agent@verdant.test', 'Maya (Support)'], ['agent2@verdant.test', 'Jon (Support)']]) {
    await pgpool.query(
        `insert into agents (email, name, password_hash) values ($1, $2, $3)
     on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash`,
        [email, name, hash],
    );
    console.log(`Agent ready: ${email}`);
}
await pgpool.end();


