'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/leaderboard', { method: 'GET' })
        const data = await res.json()
        setRows(data.rows || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
          Champions Hall
        </h1>
        <p className="text-slate-400">The fastest minds in the game.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-white/5">
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider w-12 md:w-16 text-center">Rank</th>
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Wins</th>
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider text-right hidden sm:table-cell">Best Time</th>
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider text-right hidden sm:table-cell">Best Moves</th>
                <th className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider text-right hidden md:table-cell">Last Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Loading rankings...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No games played yet. Be the first!
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.user_id || i} className="group hover:bg-white/5 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <RankBadge index={i} />
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-white">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' : 
                          i === 1 ? 'bg-slate-300 text-black' : 
                          i === 2 ? 'bg-amber-700 text-white' : 
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {(r.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[100px] md:max-w-none text-xs md:text-sm">{r.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-300 text-right text-xs md:text-sm">{r.wins ?? 0}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-300 text-right font-mono text-xs md:text-sm hidden sm:table-cell">{r.best_time ? `${r.best_time}s` : '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-300 text-right font-mono text-xs md:text-sm hidden sm:table-cell">{r.best_moves ?? '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500 text-right text-xs md:text-sm hidden md:table-cell">
                      {r.last_played ? new Date(r.last_played).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function RankBadge({ index }) {
  if (index === 0) return <span className="text-2xl">🥇</span>
  if (index === 1) return <span className="text-2xl">🥈</span>
  if (index === 2) return <span className="text-2xl">🥉</span>
  return <span className="text-slate-500 font-mono">#{index + 1}</span>
}