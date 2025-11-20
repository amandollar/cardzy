export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getGameState, deleteGameState, getUserFromReq } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // 1. Get current state to show the board one last time
    const { data: state, error } = await getGameState(user.id)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    
    // If no game, just return ok
    if (!state) return NextResponse.json({ ok: true })

    // 2. Reveal all tiles
    const revealedBoard = state.board.map(t => ({ ...t, visible: true }))

    // 3. Delete the save file (Rage quit!)
    await deleteGameState(user.id)

    return NextResponse.json({ 
      board: revealedBoard, 
      matched: state.matched,
      moves: state.moves,
      gaveUp: true
    })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}
