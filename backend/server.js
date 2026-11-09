import express from "express"
import dotenv from "dotenv"
import webhookRouter from "./routes/webhookroutes"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authroutes"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// middlewares
app.use(express.json({limit:'20kb'}))
app.use(cookieParser())

app.set("trust-proxy", 1)
app.use('/webhook', webhookRouter)
app.use('/api/auth', authRoutes)



app.get("/health-status", (req,res) => {
    console.log("hii from express server")
    res.json({success:true, message:'app initialized successfully'})
})

app.listen(PORT, () => console.log(`Express Server started on http://localhost:${PORT}`))