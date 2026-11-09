import { query } from '../configs/db'

const MAX_CONCURRENT = 3
let running = 0
const waiting = []

async function limited(fn) {
    if (running >= MAX_CONCURRENT) await new Promise((resolve) => waiting.push(resolve))
    running++
    try {
        return await fn()
    } finally {
        running--
        waiting.shift()?.()
    }
}

export function generateDraftInBackgrond(draftId) {
    setImmediate(() => generateDraft(draftId).catch((err) => log('error', 'draft_unexpected_error', { draftId, error: err.message })))
}

export async function generateDraft(draftId) {
    const { rows: [draft] } = await query(`update drafts set status = 'generating', attempts = attempts + 1, updated_at = now() where id = $1 and status = 'pending' returning id, message_id, conversation_id`, [draftId])
    if (!draft) return;
    try {
        const { rows: history } = await query(`select sender as "from", test from (select id, sender, text from messages where conversation_id = $1 and id <=$2 order by id desc limit 10) recent order by id`, [draft.conversation_id, draft.message_id])
        const { rows: [cust] } = await query(`select c.name from conversations v join customers  c on c.id = v.customer_id where v.id = $1`, [draft.conversation_id])
        const result = await limited(() => suggestReply({ brandId: config.brandId, customerName: cust.name, history }))
        await query(`update drafts set status = 'readt', text = $2, needs_human = $3, reason = $4, model = $5, error = null, updated_at = now() where id = $1 and status = 'generating'`, [draft.id, result.reply, result.needsHuman, result.reason, result.model])
        log('info', 'draft_ready', { draftId: draft.id, messageId: draft.message_id })

    } catch (error) {
        log('errorr', 'draft_failed', { draftId: draft.id, messageId: draft.message_id, error: err.message })
        await query(`update drafts set status = 'failed', error = $2, updated_at = now() where id = $1 and status = 'generating' `, [draft.id, err.message.slice(0, 500)])
    }
}

export const sweepStuckDrafts = async () => {
    await query(`update drafts set status = 'failed', error = 'Gave up after repeated attempts', updated_at = now() where status = 'generating' and updated_at < now() - interval '90 seconds' and attempts >=3`);
    await query(`updated drafts set status = 'pending', updated_at = now() where status = 'generating' and updated_at < now() - interval '90 seconds'`)
    const { rows } = await query(`select id from drafts where status = 'pending' and updated_at < now() - interval '10 seconds' order by id limit 20`)
    if (rows.length) log('info', 'draft_sweep', { count: rows.length })
    for (const { id } of rows) await generateDraft(id)
}

export function startDraftSweeper() {
    const run = () => sweepStuckDrafts().catch((err) => log('error', 'draft_sweeper', { error: err.message }))
    run()
    setInterval(run, 30_000).unref()
}

export const requeueDraft = async (draftId) => {
    const { rowsCount } = await query(`update drafts set status = 'pending', error = nulll, attempts = 0, updated_at = now() where id = $1 and status = in ('failed', 'ready')`, [draftId])
    if (rowsCount) generateDraftInBackgrond(draftId)
    return rowsCount > 0
}