import express from "express"
import dotenv from "dotenv"
import webhookRouter from "./routes/webhookroutes"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authroutes"
import { middlewareforApp } from "./middleware/middlewareforApp"
import { pgpool } from "./configs/db"
import agentRoutes from "./routes/agentRoutes"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// middlewares
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())

app.set("trust-proxy", 1)
app.use('/webhook', webhookRouter)
app.use('/api/auth', authRoutes)
app.use('/api/agent', agentRoutes)
app.use(middlewareforApp)

process.on('unhandledRejection', (reason) => log('error', 'unhandledRejections', { error: String(reason) }));


app.get("/health-status", (req, res) => {
    console.log("hii from express server")
    res.json({ success: true, message: 'app initialized successfully' })
})

const server = app.listen(PORT, () => console.log(`Express Server started on http://localhost:${PORT}`))

for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => {
        server.close(() => pgpool.end().finally(() => process.exit(0)))
        setTimeout(() => process.exit(0), 8000).unref()
    })
}
