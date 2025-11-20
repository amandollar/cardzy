export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { flipTile, getOpenIndices, isCompleted, serializeBoard } from '../../../lib/board.js'
import { nowIso, elapsedSeconds } from '../../../lib/helpers.js'
import { getGameState, upsertGameState, deleteGameState, upsertLeaderboardRow, getSupabaseServerClient, getUserFromReq, getProfile } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const index = Number(body.index)
    if (Number.isNaN(index)) return NextResponse.json({ error: 'invalid input' }, { status: 400 })
    
    const { data: state, error } = await getGameState(user.id)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    if (!state) return NextResponse.json({ error: 'not found' }, { status: 404 })
    
    let board = state.board
    const before = JSON.stringify(board)
    board = flipTile(board, index)
    let moves = state.moves
    if (JSON.stringify(board) !== before) moves += 1
    
    const open = getOpenIndices(board)
    const matchedPairs = []
    for (const t of board) if (t.matched) matchedPairs.push(t.pairId)
    const matchedSet = Array.from(new Set(matchedPairs))
    
    if (open.length === 2) {
      const updated_at = nowIso()
      const sErr = await upsertGameState({ 
        user_id: user.id, 
        board: serializeBoard(board), 
        matched: matchedSet, 
        moves, 
        time_started: state.time_started, 
        updated_at 
      })
      if (sErr.error) return NextResponse.json({ error: 'db error', detail: sErr.error.message }, { status: 500 })
      return NextResponse.json({ board: serializeBoard(board), matched: matchedSet, moves, completed: false, needs_resolution: true })
    }
    
    const completed = isCompleted(board)
    if (completed) {
      const end = nowIso()
      const secs = elapsedSeconds(state.time_started, end)
      
      // Get profile for username
      const { data: profile } = await getProfile(user.id)
      const username = profile?.username || 'Unknown'

      const row = { 
        user_id: user.id, 
        username, 
        wins: 1, 
        best_time: secs, 
        best_moves: moves, 
        last_played: end 
      }
      
      const supabase = getSupabaseServerClient()
      const { data: prev, error: prevErr } = await supabase.from('leaderboard').select('*').eq('user_id', user.id).maybeSingle()
      if (prevErr) return NextResponse.json({ error: 'db error', detail: prevErr.message }, { status: 500 })
      
      if (prev) {
        row.wins = (prev.wins || 0) + 1
        row.best_time = prev.best_time == null ? secs : Math.min(prev.best_time, secs)
        row.best_moves = prev.best_moves == null ? moves : Math.min(prev.best_moves, moves)
      }
      
      const lErr = await upsertLeaderboardRow(row)
      if (lErr.error) return NextResponse.json({ error: 'db error', detail: lErr.error.message }, { status: 500 })
      
      const dErr = await deleteGameState(user.id)
      if (dErr.error) return NextResponse.json({ error: 'db error', detail: dErr.error.message }, { status: 500 })
      
      return NextResponse.json({ board: serializeBoard(board), matched: matchedSet, moves, completed: true })
    } else {
      const updated_at = nowIso()
      const sErr = await upsertGameState({ 
        user_id: user.id, 
        board: serializeBoard(board), 
        matched: matchedSet, 
        moves, 
        time_started: state.time_started, 
        updated_at 
      })
      if (sErr.error) return NextResponse.json({ error: 'db error', detail: sErr.error.message }, { status: 500 })
      return NextResponse.json({ board: serializeBoard(board), matched: matchedSet, moves, completed: false })
    }
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}