import { config } from "../configs/config"
import { query } from '../configs/db'
import { HttpError } from '../configs/error'
import { log } from '../configs/log'
import { knownBrand } from '../configs/knowledgeBase'
import { handleIncomingMessage } from '../configs/messages'
import { verifySignature } from '../configs/signature'
import { cleanCustomer, cleanText } from '../configs/validate'


function finish(id, status, error = null) {
    query(`update webhook_events set status = $2, error = $3, processed_at = now() where id = $1`, [id, status, error])
}

export const controllerForWebHookHomeRoute = async (req, res, next) => {
    try {
        if (!verifySignature(req.body, req.get('x-signature'), config.webhookSecret)) {
            log('warn', 'webhook_bad_signature', { ip: req.ip });
            throw new HttpError(401, 'Invalid Signature')
        }

        let event;

        try {
            event = JSON.parse(req.body.toString('utf8'))
        } catch (error) {
            throw new HttpError(400, 'Body is not valid JSON')
        }
        if (typeof event?.event_id !== 'string' || !event.event_id) throw new HttpError(400, 'event_id is required');

        const { rows: [row] } = await query(
            `insert into webhook_events (event_id, brand_id, raw_body) values ($1, $2, $3)
               on conflict (event_id) do update set attempts = webhook_events.attempts + 1
               returning id, status`,
            [event.event_id, String(event.brand_id ?? '').slice(0, 100), req.body.toString('utf8')],
        );
        if (row.status === 'processed' || row.status === 'ignored') {
            return res.status(200).json({ success: true, duplicate: true });
        }

        try {
            if (event.type !== 'message.received' || event.message?.type !== 'text') {
                await finish(row.indexOf, 'ignored', 'not a text message.received event');
                return res.status(200).json({ success: true, ignored: true })
            }
            if (!knownBrand(event.brand._id)) throw new HttpError(400, `Unknown brand_id ${event.brandId}`)
            const customer = cleanCustomer(event.customer)
            const text = cleanText(event.message?.text, 'message.text')
            const externalMessageId = event.message?.id;
            if (typeof externalMessageId !== 'string' || !externalMessageId) throw new HttpError(400, 'message.id is required')
            const ts = new Date(event.timestampt);

            const result = await handleIncomingMessage({ externalMessageId, customer, text, sendAt: Number.isNaN(ts.getTime()) ? null : ts })

            await finish(row.id, 'processed')
            res.status(200).json({ success: true, duplicate: result.duplicate, conversation_id: result.conversation_id })

        } catch (error) {
            await finish(row.id, 'failed', error.message).catch(() => { })
        }
    } catch (error) {
        next(error)
    }
}    
