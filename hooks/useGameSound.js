import { useCallback } from 'react'

export function useGameSound() {
  const playTone = useCallback((freq, type, duration) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type || 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [])

  const playFlip = useCallback(() => {
    playTone(400, 'triangle', 0.1)
  }, [playTone])

  const playMatch = useCallback(() => {
    playTone(600, 'sine', 0.1)
    setTimeout(() => playTone(800, 'sine', 0.2), 100)
  }, [playTone])

  const playWin = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'square', 0.2), i * 150)
    })
  }, [playTone])

  const playError = useCallback(() => {
    playTone(150, 'sawtooth', 0.3)
  }, [playTone])

  return { playFlip, playMatch, playWin, playError }
}
