import { query, withTransaction } from "../configs/db"
import { HttpError } from "../configs/error";
import { requeueDraft } from '../configs/draft'
import { cleanText } from '../configs/validate'

const id = (value) => {
    if (!/^\d{1,18}$/.test(String(value))) throw new HttpError(400, 'Invalid ID ');
    return value
}

export const controllerForagentConversation = async (req, res, next) => {
    try {
        const { rows } = await query(
            `select v.id, c.name as customer_name, c.phone as customer_phone,
                      last.text as preview, last.sender as last_sender, v.last_message_at,
                      d.status as draft_status, d.needs_human
               from conversations v
               join customers c on c.id = v.customer_id
               join lateral (select text, sender from messages where conversation_id = v.id order by id desc limit 1) last on true
               left join lateral (
                 select d.status, d.needs_human from drafts d
                 join messages m on m.id = d.message_id
                 where d.conversation_id = v.id and m.sender = 'customer' order by m.id desc limit 1
               ) d on true
               where v.status = 'open'
               order by v.last_message_at desc, v.id desc
               limit 200`,
        );
        res.json({
            success: true,
            conversation: rows.map((conv) => ({
                ...conv,
                preview: conv.preview.length > 120 ? conv.preview.slice(0, 117) + '...' : conv.preview,
                awaiting_reply: conv.last_sender === 'customer',
                draft_status: conv.last_sender === 'customer' ? conv.draft_status : null,
                needs_human: conv.last_sender === 'customer' && conv.needs_human === true
            }))
        })
    } catch (error) {
        next(error)
    }
}

export const getParticularConversation = async (req, res, next) => {
    try {
        const convId = id(req.params.id)
        const { rows: [conv] } = await query(
            `select v.id, c.name as customer_name, c.phone as customer_phone
               from conversations v join customers c on c.id = v.customer_id where v.id = $1`, [convId],
        );
        if (!conv) throw new HttpError(404, 'Conversation not found');
        const { rows: messages } = await query(
            `select id, sender, text, created_at from messages where conversation_id = $1 order by id`, [convId],
        );
        const { rows: [draft] } = await query(
            `select d.id, d.status, d.text, d.needs_human, d.reason, d.error, d.updated_at
       from drafts d join messages m on m.id = d.message_id
       where d.conversation_id = $1 and m.sender = 'customer' order by m.id desc limit 1`, [convId],
        );

        res.json({ success: true, conversation: conv, messages, draft: draft ?? null })
    } catch (error) {
        next(error)
    }
}

export const controllerforApproval = async (req, res, next) => {
    try {
        const draftId = id(req.params.id)
        const text = cleanText(req.body?.text, 'Reply');
        const message = await withTransaction(async (db) => {
            const { rows: [draft] } = await db.query(
                `select id, conversation_id, text, status from drafts where id = $1 for update`, [draftId],
            );
            if (!draft) throw new HttpError(404, 'Draft not found');
            if (draft.status === 'used') throw new HttpError(409, 'This draft was already approved');

            const { rows: [msg] } = await db.query(
                `insert into messages (conversation_id, sender, agent_id, text, sent_at)
                 values ($1, 'agent', $2, $3, now()) returning id, sender, text, created_at`,
                [draft.conversation_id, req.agent.id, text],
            );
            await db.query(
                `update drafts set status = 'used', reply_message_id = $2, edited = ($3::text is distinct from text),
                        updated_at = now() where id = $1`,
                [draft.id, msg.id, text],
            );
            await db.query(`update conversations set last_message_at = now() where id = $1`, [draft.conversation_id]);
            return msg;
        });
        res.status(201).json({ success: true, message })
    } catch (error) {
        next(error)
    }
}

export async function regenerateController(req, res, next) {
    try {
        const queued = await requeueDraft(id(req.params.id))
        if (!queued) throw new HttpError(409, 'This draft cannot be regenerated right now');
        res.status(202).json({ success: true })
    } catch (error) {
        next(error)
    }
}