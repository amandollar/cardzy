export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { deleteGameState, getUserFromReq } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { error } = await deleteGameState(user.id)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}