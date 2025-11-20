export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { themes, defaultImages } from '../../../lib/images.js'
import { generateBoard, serializeBoard } from '../../../lib/board.js'
import { nowIso } from '../../../lib/helpers.js'
import { upsertGameState, getUserFromReq, getSupabaseServerClient } from '../../../lib/supabase.js'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json()
    const difficulty = String(body.difficulty || '4x4')
    const theme = String(body.theme || 'fruits')
    
    let selectedImages = themes[theme] || defaultImages
    
    if (theme === 'custom') {
      const supabase = getSupabaseServerClient()
      const { data: profile } = await supabase.from('profiles').select('custom_images').eq('id', user.id).single()
      if (profile?.custom_images && profile.custom_images.length > 0) {
        // Create image elements for board generation
        // The Tile component expects simple strings (emojis) OR it can handle <img> tags if we change it?
        // Currently Tile.jsx renders `{visible ? tile.image : '?'}`.
        // If tile.image is a URL string, it will just render the URL text.
        // We need to wrap it in an <img /> tag in the frontend OR make Tile.jsx smart.
        // Let's store an object or just the URL and update Tile.jsx.
        // For now, let's just pass the URL string. Tile.jsx needs update.
        selectedImages = profile.custom_images
      }
    }

    let pairCount = 8 // default 4x4

    if (difficulty === '6x6') {
      pairCount = 18
    } else if (difficulty === '4x6') {
      pairCount = 12
    }
    
    // If we don't have enough custom images, fill the rest with default emojis (fruits)
    if (selectedImages.length < pairCount) {
        const missingCount = pairCount - selectedImages.length
        // Take defaults (fruits) to fill the gaps
        const fillers = defaultImages.slice(0, missingCount)
        selectedImages = [...selectedImages, ...fillers]
    }

    const board = generateBoard(selectedImages, pairCount)
    const matched = []
    const moves = 0
    const time_started = nowIso()
    const updated_at = nowIso()
    
    const state = { 
      user_id: user.id, 
      board: serializeBoard(board), 
      matched, 
      moves, 
      time_started, 
      updated_at 
    }
    
    const { error } = await upsertGameState(state)
    if (error) return NextResponse.json({ error: 'db error', detail: error.message }, { status: 500 })
    return NextResponse.json({ board: state.board, matched, moves })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}