import './globals.css'
import Link from 'next/link'
import { Press_Start_2P } from 'next/font/google'
import AuthProvider from '../components/AuthProvider'
import ToastProvider from '../components/ToastProvider'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = { 
  title: "Cardzy", 
  description: "The ultimate memory puzzle game" 
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.className} min-h-screen flex flex-col text-slate-200 selection:bg-blue-500 selection:text-white leading-relaxed`}>
        <AuthProvider>
          <ToastProvider>
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            
            <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
              <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 text-xs">
                    C
                  </div>
                  <span className="text-sm md:text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tighter">Cardzy</span>
                </Link>
                
                <nav className="flex items-center gap-2">
                  <NavLink href="/game">Game</NavLink>
                  <NavLink href="/leaderboard">Rank</NavLink>
                </nav>
              </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 text-sm">
              {children}
            </main>

            <footer className="border-t border-white/5 bg-slate-950/30 py-8 mt-auto">
              <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-xs">
                <p>&copy; {new Date().getFullYear()} Cardzy. Built for fun.</p>
              </div>
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

function NavLink({ href, children }) {
  return (
    <Link 
      href={href} 
      className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  )
}