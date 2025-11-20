'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client'
import { useAuth } from '../components/AuthProvider'

export default function Page() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) router.push('/game')
  }, [user, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (authError) throw authError
        // Redirect happens in AuthProvider
      } else {
        if (username.length < 3) throw new Error('Username must be at least 3 chars')
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        })
        if (authError) throw authError
        if (!authData.user) throw new Error('Signup failed')

        if (authData.user && !authData.session) {
          throw new Error('Account created! Please check your email to confirm.')
        }

        // Profile is created automatically via SQL Trigger (see supabase_triggers.sql)

        // Success, redirect will happen
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (user) return null

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-2xl shadow-blue-900/20 rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="text-3xl md:text-4xl">🎮</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
            Cardzy
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-medium">
            Train your brain with the ultimate memory challenge.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase">
                  Email
                </label>
                <input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase">
                    Username
                  </label>
                  <input 
                    type="text"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="GamerTag123"
                    required
                    minLength={3}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase">
                  Password
                </label>
                <input 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-blue-900/20 transform active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}