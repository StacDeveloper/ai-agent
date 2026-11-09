import { withTransaction } from '../configs/db'
import { generateDraftInBackgrond } from "../configs/draft"

export const handleIncomingMessage = async ({ externalMessageId, customer, text, sendAt = null }) => {
const stored = await withTransaction(async (db)=>{
    const {rows:[cust]} = await db.query(
        `insert into customers (external_id, name, phone) values ($1, $2, $3) on conflict (external_id) do updated set name = excluded.name, phone = excluded.phone returning id`,[customer.externalId, customer.name, customer.phone]
    )
    
})

}