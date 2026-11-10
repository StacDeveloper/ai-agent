import 'dotenv/config'

const required = ["DATABASE_URL", "JWT_SECRET", "WEBHOOK_SECRET"];
const missing = required.filter((word) => !process.env[word])
if (missing.length) {
    console.error(`This api key is missing ${missing}`)
    process.exit(1)
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    isProd: process.env.NODE_ENV === "production",
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
    brandId: "verdant-co",
    gemini: {
        apikey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
        baseurl: process.env.GEMINI_BASE_URL
    }
}