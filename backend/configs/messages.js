import { withTransaction } from '../configs/db.js'
import { generateDraftInBackgrond } from "../configs/draft.js"


export const handleIncomingMessage = async ({ externalMessageId, customer, text, sendAt = null }) => {
    const stored = await withTransaction(async (db) => {
        const { rows: [cust] } = await db.query(
            `insert into customers (external_id, name, phone) values ($1, $2, $3)
   on conflict (external_id) do update set name = excluded.name, phone = excluded.phone
   returning id`,
            [customer.externalId, customer.name, customer.phone],
        );
        ;
        let conv = (await db.query(
            `select id from conversations where customer_id = $1 and status = 'open'`,
            [cust.id]
        )).rows[0];

        if (!conv) {
            conv = (await db.query(
                `insert into conversations (customer_id, status, last_message_at)
         values ($1, 'open', now())
         returning id`,
                [cust.id]
            )).rows[0];
        }
        console.log({ cust, conv })
        const message = (await db.query(`insert into messages (conversation_id, external_id, sender, text, sent_at) values ($1, $2, 'customer', $3, $4)on conflict (external_id) do nothing returning id`, [conv.id, externalMessageId, text, sendAt])).rows[0]
        if (!message) return { duplicate: true, conversationId: conv.id }
        await db.query(`update conversations set last_message_at = now() where id = $1`, [conv.id]);

        const draft = (await db.query(`insert into drafts (message_id, conversation_id) values ($1, $2) returning id`, [message.id, conv.id])).rows[0]
        return { duplicate: false, conversationId: conv.id, messageId: message.id, draftId: draft.id }
    })

    if (!stored.duplicate) generateDraftInBackgrond(stored.draftId);
    return stored


}