import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getUserFromReq, getSupabaseServerClient } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file')
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // 1. Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // 2. Save URL to user profile in Supabase
    // We'll assume a 'custom_images' array in profiles. 
    // First fetch existing
    const supabase = getSupabaseServerClient()
    const { data: profile } = await supabase.from('profiles').select('custom_images').eq('id', user.id).single()
    
    let images = profile?.custom_images || []
    if (!Array.isArray(images)) images = []
    
    images.push(blob.url)
    
    // Limit to e.g. 18 images (max for 6x6)
    if (images.length > 18) {
      // Optional: delete old blobs? For now just slice
      images = images.slice(-18)
    }

    const { error } = await supabase.from('profiles').update({ custom_images: images }).eq('id', user.id)
    
    if (error) throw error

    return NextResponse.json(blob)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
