export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { updateMatchedState, isCompleted, serializeBoard } from '../../../lib/board.js'
import { nowIso, elapsedSeconds } from '../../../lib/helpers.js'
import { getGameState, upsertGameState, deleteGameState, upsertLeaderboardRow, getSupabaseServerClient, getUserFromReq, getProfile } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: state, error } = await getGameState(user.id)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    if (!state) return NextResponse.json({ error: 'not found' }, { status: 404 })

    let board = state.board
    board = updateMatchedState(board)
    
    const matchedPairs = []
    for (const t of board) if (t.matched) matchedPairs.push(t.pairId)
    const matchedSet = Array.from(new Set(matchedPairs))
    
    const completed = isCompleted(board)
    if (completed) {
      const end = nowIso()
      const secs = elapsedSeconds(state.time_started, end)
      
      // Get profile
      const { data: profile } = await getProfile(user.id)
      const username = profile?.username || 'Unknown'

      console.log(`[GAME WON] User: ${username} (${user.id}), Time: ${secs}s, Moves: ${state.moves}`)

      const row = { 
        user_id: user.id, 
        username, 
        wins: 1, 
        best_time: secs, 
        best_moves: state.moves, 
        last_played: end 
      }
      
      const supabase = getSupabaseServerClient()
      const { data: prev, error: prevErr } = await supabase.from('leaderboard').select('*').eq('user_id', user.id).maybeSingle()
      
      if (prevErr) {
        console.error('[LEADERBOARD ERROR] Fetch prev:', prevErr)
        return NextResponse.json({ error: 'db error', detail: prevErr.message }, { status: 500 })
      }
      
      if (prev) {
        row.wins = (prev.wins || 0) + 1
        row.best_time = prev.best_time == null ? secs : Math.min(prev.best_time, secs)
        row.best_moves = prev.best_moves == null ? state.moves : Math.min(prev.best_moves, state.moves)
      }
      
      const lErr = await upsertLeaderboardRow(row)
      if (lErr.error) {
        console.error('[LEADERBOARD ERROR] Upsert:', lErr.error)
        return NextResponse.json({ error: 'db error', detail: lErr.error.message }, { status: 500 })
      }
      
      const dErr = await deleteGameState(user.id)
      if (dErr.error) console.error('[GAME STATE ERROR] Delete:', dErr.error)
      
      return NextResponse.json({ board: serializeBoard(board), matched: matchedSet, moves: state.moves, completed: true })
    } else {
      const updated_at = nowIso()
      const sErr = await upsertGameState({ 
        user_id: user.id, 
        board: serializeBoard(board), 
        matched: matchedSet, 
        moves: state.moves, 
        time_started: state.time_started, 
        updated_at 
      })
      if (sErr.error) return NextResponse.json({ error: 'db error', detail: sErr.error.message }, { status: 500 })
      return NextResponse.json({ board: serializeBoard(board), matched: matchedSet, moves: state.moves, completed: false })
    }
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}