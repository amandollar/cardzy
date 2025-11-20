export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getGameState, getUserFromReq } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: state, error } = await getGameState(user.id)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    if (!state) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ board: state.board, matched: state.matched || [], moves: state.moves || 0 })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}