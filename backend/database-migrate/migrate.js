import fs from "node:fs"
import path from "node:path"
import { pgpool } from "../configs/db.js"

const sql = fs.readFileSync(path.join(import.meta.dirname, "schema.sql"), "utf8")

try {
  await pgpool.query(sql)
  console.log("Schema is ready for app to use")
} catch (err) {
  console.error("Migration failed:", err.message)
  process.exitCode = 1
} finally {
  await pgpool.end()
}