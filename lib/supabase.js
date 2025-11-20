import { createClient } from '@supabase/supabase-js'

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) throw new Error('Supabase env missing')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function getUserFromReq(req) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) return null
  return user
}

// 'player' argument is now 'user_id' (uuid)
export async function getGameState(userId) {
  const supabase = getSupabaseServerClient()
  return await supabase.from('game_state').select('*').eq('user_id', userId).maybeSingle()
}

export async function upsertGameState(state) {
  const supabase = getSupabaseServerClient()
  // state must have user_id
  return await supabase.from('game_state').upsert(state, { onConflict: 'user_id' })
}

export async function deleteGameState(userId) {
  const supabase = getSupabaseServerClient()
  return await supabase.from('game_state').delete().eq('user_id', userId)
}

export async function getLeaderboardRows() {
  const supabase = getSupabaseServerClient()
  // Returns rows with username and stats
  return await supabase.from('leaderboard').select('*').order('wins', { ascending: false }).limit(50)
}

export async function upsertLeaderboardRow(row) {
  const supabase = getSupabaseServerClient()
  return await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' })
}

export async function getProfile(userId) {
  const supabase = getSupabaseServerClient()
  return await supabase.from('profiles').select('username').eq('id', userId).single()
}