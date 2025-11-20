'use client'
import { useEffect, useState } from 'react'
import Tile from '../../components/Tile.jsx'
import Link from 'next/link'
import { useGameSound } from '../../hooks/useGameSound'
import { useAuth } from '../../components/AuthProvider'
import { supabase } from '../../lib/supabase-client'
import { useToast } from '../../components/ToastProvider'

export default function Page() {
  const { user, session } = useAuth()
  const { addToast } = useToast()
  const [username, setUsername] = useState('')
  const [board, setBoard] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [givenUp, setGivenUp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [resolving, setResolving] = useState(false)
  
  // Settings
  const [difficulty, setDifficulty] = useState('4x4')
  const [theme, setTheme] = useState('fruits')
  const [showSettings, setShowSettings] = useState(false)
  const [customImages, setCustomImages] = useState([])
  const [uploading, setUploading] = useState(false)

  const { playFlip, playMatch, playWin, playError } = useGameSound()

  useEffect(() => {
    if (!user) return
    // Fetch profile username and custom images
    supabase.from('profiles').select('username, custom_images').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username)
          if (data.custom_images) setCustomImages(data.custom_images)
        }
      })
    loadGame()
  }, [user])

  async function authFetch(url, options = {}) {
    if (!session) return { ok: false, status: 401 }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers
    }
    return fetch(url, { ...options, headers })
  }

  async function loadGame() {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/load', { method: 'POST', body: JSON.stringify({}) })
      if (res.ok) {
        const data = await res.json()
        updateState(data)
      } else if (res.status === 404) {
        await startNewGame()
      } else {
        clearState()
        setError('Server error loading game')
      }
    } catch (e) {
      clearState()
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function startNewGame(newDiff, newTheme) {
    const diff = newDiff || difficulty
    const th = newTheme || theme
    setDifficulty(diff)
    setTheme(th)

    try {
      const res = await authFetch('/api/start', { 
        method: 'POST', 
        body: JSON.stringify({ difficulty: diff, theme: th }) 
      })
      
      if (res.ok) {
        const data = await res.json()
        updateState(data)
        setCompleted(false)
        setGivenUp(false)
        setShowSettings(false)
      } else {
        clearState()
        setError('Server error starting game')
      }
    } catch (e) {
      clearState()
      setError('Network error')
    }
  }

  function updateState(data) {
    setBoard(Array.isArray(data.board) ? data.board : [])
    setMatched(Array.isArray(data.matched) ? data.matched : [])
    setMoves(Number.isFinite(data.moves) ? data.moves : 0)
    const boardLen = data.board?.length || 0
    if (boardLen === 36) setDifficulty('6x6')
    else if (boardLen === 24) setDifficulty('4x6')
    else setDifficulty('4x4')
  }

  function clearState() {
    setBoard([])
    setMatched([])
    setMoves(0)
  }

  async function handleClick(i) {
    if (completed || resolving || loading) return
    playFlip()
    try {
      const res = await authFetch('/api/click', { method: 'POST', body: JSON.stringify({ index: i }) })
      if (!res.ok) {
        playError()
        return
      }
      const data = await res.json()
      updateState(data)
      setCompleted(Boolean(data.completed))
      
      if (data.completed) {
        playWin()
      } else if (data.needs_resolution) {
        setResolving(true)
        setTimeout(async () => {
          const r = await authFetch('/api/resolve', { method: 'POST', body: JSON.stringify({}) })
          if (r.ok) {
            const d = await r.json()
            if (d.matched?.length > matched.length) {
              playMatch()
            }
            updateState(d)
            setCompleted(Boolean(d.completed))
            if (d.completed) playWin()
            
            if (!d.completed) {
              saveGame(d)
            }
          }
          setResolving(false)
        }, 600)
      } else {
        saveGame(data)
      }
    } catch (e) {
      playError()
      setError('Network error')
    }
  }

  async function saveGame(data) {
    await authFetch('/api/save', { method: 'POST', body: JSON.stringify({ 
      board: Array.isArray(data.board) ? data.board : [], 
      matched: Array.isArray(data.matched) ? data.matched : [], 
      moves: Number.isFinite(data.moves) ? data.moves : 0 
    }) })
  }

  async function handleGiveUp() {
    if (!confirm('Are you sure you want to give up? This will count as a loss.')) return
    try {
      const res = await authFetch('/api/giveup', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.board) {
          setBoard(data.board)
          setMatched(data.matched || [])
          setMoves(data.moves || 0)
          setGivenUp(true)
          playError() // Sad sound
        } else {
          // Fallback if no state
          startNewGame()
        }
      }
    } catch (e) {
      setError('Network error')
    }
  }

  async function handleRestart() {
    await authFetch('/api/reset', { method: 'POST', body: JSON.stringify({}) })
    await startNewGame()
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 4 * 1024 * 1024) {
      addToast('File size must be less than 4MB', 'error')
      return
    }

    setUploading(true)
    try {
      // We need to use standard fetch for FormData, but with our auth token
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })
      
      if (!res.ok) throw new Error('Upload failed')
      
      const blob = await res.json()
      const newImages = [...customImages, blob.url]
      setCustomImages(newImages)
      addToast('Image uploaded successfully!', 'success')
      // If current theme is custom, it will be updated on next new game
    } catch (err) {
      console.error(err)
      addToast('Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null // AuthProvider will redirect

  return (
    <main className="max-w-3xl mx-auto relative">
      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8 bg-slate-900/50 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-white/5 shadow-lg gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Player</span>
            <span className="text-base md:text-lg font-bold text-white max-w-[120px] truncate">{username || '...'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 md:px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] md:text-xs font-medium transition-colors border border-slate-700 flex items-center gap-2"
          >
            <span>⚙️</span> <span className="hidden sm:inline">Settings</span>
          </button>
          <div className="flex flex-col items-end min-w-[40px] md:min-w-[60px]">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Moves</span>
            <span className="text-base md:text-lg font-bold text-blue-400 font-mono">{moves}</span>
          </div>
          <button 
            onClick={handleRestart}
            className="px-3 md:px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] md:text-xs font-medium transition-colors border border-slate-700"
          >
            Reset
          </button>
          <button 
            onClick={handleGiveUp}
            disabled={completed || givenUp}
            className="px-3 md:px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-200 text-[10px] md:text-xs font-medium transition-colors border border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Give Up
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-8 bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-white/10 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 text-white">New Game Settings</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Difficulty</label>
              <div className="flex gap-2">
                {['4x4', '4x6', '6x6'].map(d => (
                  <button
                    key={d}
                    onClick={() => startNewGame(d, theme)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      difficulty === d 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Theme</label>
              <div className="flex gap-2 flex-wrap">
                {['fruits', 'space', 'animals', 'sports', 'custom'].map(t => (
                  <button
                    key={t}
                    onClick={() => startNewGame(difficulty, t)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                      theme === t 
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              {theme === 'custom' && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-slate-300 mb-2">My Images ({customImages.length})</h4>
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {customImages.map((url, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <label className={`aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-slate-500 flex items-center justify-center cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-2xl text-slate-500">+</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {(() => {
                      const required = difficulty === '6x6' ? 18 : difficulty === '4x6' ? 12 : 8
                      const count = customImages.length
                      const missing = required - count
                      
                      if (count === 0) return 'Upload an image to start your custom collection!'
                      if (missing > 0) return `You have ${count} custom images. We will add ${missing} fruit${missing > 1 ? 's' : ''} to fill the board.`
                      return `You have enough images for ${difficulty} mode!`
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
            Starting a new game will reset your current progress.
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className="relative">
        <div className={`rounded-3xl border border-slate-800 bg-slate-900/30 p-6 shadow-2xl transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-3xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className={`grid gap-2 sm:gap-4 mx-auto transition-all ${
            difficulty === '6x6' ? 'grid-cols-6 max-w-2xl' : 
            difficulty === '4x6' ? 'grid-cols-4 sm:grid-cols-6 max-w-2xl' : 
            'grid-cols-4 max-w-md'
          } ${resolving ? 'pointer-events-none' : ''}`}>
            {Array.isArray(board) && board.map((tile, i) => (
              <Tile key={i} tile={tile} onClick={() => handleClick(i)} disabled={resolving || completed || givenUp} />
            ))}
          </div>
        </div>

        {/* Completion Overlay */}
        {completed && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-md rounded-3xl animation-fade-in">
            <div className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform scale-100 animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
              <p className="text-slate-400 mb-6">You completed the puzzle in <span className="text-white font-bold">{moves}</span> moves.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleRestart} 
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg transition-transform active:scale-95"
                >
                  Play Again
                </button>
                <Link 
                  href="/leaderboard" 
                  className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay (Give Up) */}
        {givenUp && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="text-center p-6 bg-slate-900/90 backdrop-blur-xl border border-red-900/30 rounded-2xl shadow-2xl max-w-sm w-full mx-4 pointer-events-auto animate-fade-in">
              <div className="text-4xl mb-3">💀</div>
              <h2 className="text-2xl font-bold text-red-200 mb-2">Game Over</h2>
              <p className="text-slate-400 mb-6 text-sm">You revealed the solution.<br/>Better luck next time!</p>
              
              <button 
                onClick={handleRestart} 
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-lg transition-transform active:scale-95 border border-white/10"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}