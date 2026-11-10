import { cleanCustomer, cleanText } from '../configs/validate.js'
import { HttpError } from '../configs/error.js'
import { query } from '../configs/db.js'
import { handleIncomingMessage } from '../configs/messages.js'
import crypto from 'node:crypto'


export const getMessagesForCustomer = async (req, res, next) => {
    try {
        const customer = cleanCustomer(req.body?.customer);
        const text = cleanText(req.body?.text)
        const result = await handleIncomingMessage({
            externalMessageId: `web ${crypto.randomUUID()}`, customer, text, sendAt: new Date()
        })
        res.status(201).json({ success: true, conversation_id: result.conversation_id })
    } catch (error) {
        next(error)
    }
}

export const getConversationForCustomer = async (req, res, next) => {
    try {
        const externalId = String(req.query.customer_id ?? '')
        if (!/^[A-Za-z0-9_-]{3,64}$/.test(externalId)) throw new HttpError(400, 'customer_id is invalid');
        const { rows } = await query(
            `select m.id, m.sender, m.text, m.created_at
                from messages m
                join conversations v on v.id = m.conversation_id and v.status = 'open'
                join customers c on c.id = v.customer_id
                where c.external_id = $1
                order by m.id`,
            [externalId],
        );

        res.json({ succcess: true, messages: rows })
    } catch (error) {
        next(error)
    }
}