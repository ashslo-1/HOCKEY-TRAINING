import type { GameEvent } from './types'

// Sound effects generated with the Web Audio API. No audio files are loaded.
// The AudioContext is created on the first sound after the player turns sound on.
export class GameSound {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private lastBoard = 0

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      this.ctx = new Ctor()
    } catch {
      return null
    }
    const len = Math.floor(this.ctx.sampleRate * 0.5)
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return this.ctx
  }

  // Call from a click handler so browsers allow audio to start
  unlock() {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {})
  }

  close() {
    if (this.ctx) void this.ctx.close().catch(() => {})
    this.ctx = null
    this.noise = null
  }

  private burst(ctx: AudioContext, at: number, dur: number, freq: number, q: number, gain: number) {
    if (!this.noise) return
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    src.connect(filter).connect(g).connect(ctx.destination)
    src.start(at)
    src.stop(at + dur + 0.02)
  }

  private tone(ctx: AudioContext, at: number, dur: number, freq: number, type: OscillatorType, gain: number, endFreq?: number) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, at)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, at + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(gain, at + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    osc.connect(g).connect(ctx.destination)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }

  play(event: GameEvent) {
    const ctx = this.ensure()
    if (!ctx || ctx.state !== 'running') return
    const t = ctx.currentTime
    switch (event) {
      case 'shot': // stick slap
        this.burst(ctx, t, 0.09, 1800, 0.9, 0.5)
        this.tone(ctx, t, 0.06, 180, 'triangle', 0.25, 90)
        break
      case 'pass':
        this.burst(ctx, t, 0.05, 2400, 1.2, 0.2)
        break
      case 'save': // puck into pads
        this.tone(ctx, t, 0.16, 140, 'sine', 0.5, 60)
        this.burst(ctx, t, 0.08, 700, 0.8, 0.3)
        break
      case 'board':
        if (t - this.lastBoard < 0.12) return
        this.lastBoard = t
        this.burst(ctx, t, 0.12, 400, 0.7, 0.25)
        break
      case 'post': // ring off the iron
        this.tone(ctx, t, 0.5, 1250, 'sine', 0.18)
        this.tone(ctx, t, 0.4, 1870, 'sine', 0.08)
        break
      case 'goal': // horn
        for (const f of [220, 277, 330]) this.tone(ctx, t, 1.1, f, 'sawtooth', 0.06)
        break
      case 'wide':
        this.tone(ctx, t, 0.15, 520, 'triangle', 0.08, 380)
        break
    }
  }
}
