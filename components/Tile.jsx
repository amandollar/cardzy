'use client'

export default function Tile({ tile, onClick, disabled }) {
  const visible = tile.visible || tile.matched
  
  return (
    <div 
      className={`relative aspect-square group perspective-1000 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={`w-full h-full transition-all duration-500 transform-style-3d ${visible ? 'rotate-y-180' : ''} ${!disabled && !visible ? 'group-hover:scale-105' : ''}`}>
        
        {/* Front Face (Face Down / Pattern) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl border border-white/10 shadow-xl bg-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold text-xl md:text-2xl select-none">
            ?
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Back Face (Face Up / Content) */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-xl border border-white/10 flex items-center justify-center text-3xl md:text-4xl select-none overflow-hidden ${
          tile.matched 
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-900/50' 
            : 'bg-slate-800 text-white'
        }`}>
          {/* Content Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          
          {/* The Actual Content */}
          <div className="relative z-10 transform transition-transform duration-500 w-full h-full flex items-center justify-center p-2">
            {typeof tile.image === 'string' && tile.image.startsWith('http') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={tile.image} alt="card" className="w-full h-full object-contain rounded-lg" />
            ) : (
              tile.image
            )}
          </div>

          {/* Matched Glow */}
          {tile.matched && (
            <div className="absolute inset-0 bg-emerald-400/20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  )
}