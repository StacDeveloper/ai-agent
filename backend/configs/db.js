import { config } from "../configs/config.js"
import pg from "pg"
import { log } from "../configs/log.js"

export const pgpool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
})

pgpool.on("error", (err) => log("error", "pg-pool-error", { error: err.message }))

export const query = (text, params)=>pgpool.query(text, params)

export async function withTransaction(weWillPassOneFunction){
    const client = await pgpool.connect()
    try {
        await client.query('begin')
        const result = await weWillPassOneFunction(client)
        await client.query('commit')
        return result
    } catch (error) {
        await client.query('rollback').catch((err)=>err)
        throw error
    }finally{
        client.release()
    }
}