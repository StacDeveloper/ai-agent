import express from "express"
import dotenv from "dotenv"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// middlewares
app.use(express.json())

app.get("/", () => {
    console.log("hii from express server")
})

app.listen(PORT, () => console.log("Express Server started!"))