export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase.js'
export async function GET() {
  const supabase = getSupabaseServerClient()
  
  // Simplify query to match debug route first
  // const { data, error } = await supabase.from('leaderboard').select('*').order('best_time', { ascending: true }).order('best_moves', { ascending: true })
  const { data, error } = await supabase.from('leaderboard').select('*')
  
  if (error) {
    console.error('[LEADERBOARD GET ERROR]', error)
    return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
  }
  
  // Manually sort in JS for now to rule out DB sorting issues
  const sorted = (data || []).sort((a, b) => {
    if (a.best_time !== b.best_time) return a.best_time - b.best_time
    return a.best_moves - b.best_moves
  })
  
  console.log('[LEADERBOARD FETCH]', sorted.length, 'rows')
  
  return NextResponse.json({ rows: sorted })
}