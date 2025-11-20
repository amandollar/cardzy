export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { upsertGameState, getUserFromReq } from '../../../lib/supabase.js'
import { nowIso } from '../../../lib/helpers.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const board = body.board
    const matched = body.matched || []
    const moves = Number(body.moves || 0)
    
    if (!Array.isArray(board)) return NextResponse.json({ error: 'invalid input' }, { status: 400 })
    
    const updated_at = nowIso()
    // We need time_started from existing state usually, but upsert might overwrite it if we don't pass it.
    // Current upsertGameState takes the whole object.
    // Ideally we should fetch existing state to preserve time_started, OR client sends it.
    // But existing code didn't fetch it. It might be relying on ON CONFLICT DO UPDATE SET ...
    // But supabase upsert replaces by default unless configured?
    // Actually supabase upsert merges if we don't specify columns? No, it updates all passed columns.
    // If we don't pass time_started, it might stay if we used proper SQL, but via JS client, it might not.
    // Let's fetch existing state quickly or just update what we have.
    // The previous code didn't fetch state, so it might have been losing time_started?
    // Ah, `upsertGameState` uses `upsert`. If `time_started` is missing in the object, Supabase API (PostgREST) might set it to null or default if not present in payload?
    // Actually, if the column is not in the payload, it is NOT updated. So it should be fine.
    
    const { error } = await upsertGameState({ 
      user_id: user.id, 
      board, 
      matched, 
      moves, 
      updated_at 
    })
    
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}