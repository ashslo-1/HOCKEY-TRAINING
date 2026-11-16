import { useEffect, useRef } from 'react'
import {
  CR, CY, GOAL_X, GOALIE_R, GOALIE_RANGE, GOALIE_SPEED, L, NET_DEPTH, NET_HALF, PUCK_R, W,
  applyRinkTransform, clamp, computeLayout, goalieX,
  type Goalie, type Puck, type Spark,
} from '../rink/geometry'
import { drawGoalie, drawGoalLight, drawPuck, drawStatic } from '../rink/draw'

const GRAB_PX = 34 // how close (in screen px) a press must be to the puck to pick it up
const MAX_SPEED = 150 // ft/s cap on a flung puck
const TAP_SPEED = 95 // ft/s for a tap-to-shoot
const TAP_MAX_MOVE = 8 // px a press can move and still count as a tap
const DEMO_PAUSE = 6 // seconds after the visitor's last touch before the computer starts shooting again
const VELOCITY_WINDOW = 0.09 // seconds of pointer history used to measure a fling

// Visitors can drag the puck and let go to fling it, or tap the ice to shoot toward that spot
export default function Rink() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const staticCanvas = document.createElement('canvas')
    const sctx = staticCanvas.getContext('2d')!
    const trailCanvas = document.createElement('canvas')
    const tctx = trailCanvas.getContext('2d')!
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let lay = computeLayout(1, 1, 1)
    const puck: Puck = { x: L / 2, y: CY, vx: 0, vy: 0, spin: 0 }
    let sparks: Spark[] = []
    let idle = 0.9 // seconds until the next demo shot or pass
    let trailFade = 0 // seconds since the trail was last faded
    let goal: { left: boolean; t: number } | null = null
    const goalies: Goalie[] = [
      { left: true, y: CY, saveT: 0, player: false },
      { left: false, y: CY, saveT: 0, player: false },
    ]

    // Visitor interaction state
    let sinceTouch = DEMO_PAUSE // seconds since the visitor last moved the puck
    let held: { id: number; samples: { t: number; x: number; y: number }[] } | null = null
    let press: { id: number; sx: number; sy: number } | null = null // a press on the ice away from the puck
    let hoverGrab = false

    const clearTrail = () => {
      tctx.setTransform(1, 0, 0, 1, 0, 0)
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
    }

    // Screen position (relative to the canvas) to rink feet. Portrait rinks swap the axes.
    const toRink = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const sx = clientX - rect.left
      const sy = clientY - rect.top
      return lay.portrait
        ? { x: (sy - lay.oy) / lay.s, y: (sx - lay.ox) / lay.s }
        : { x: (sx - lay.ox) / lay.s, y: (sy - lay.oy) / lay.s }
    }
    const onIce = (p: { x: number; y: number }) => p.x > 0 && p.x < L && p.y > 0 && p.y < W
    const nearPuck = (clientX: number, clientY: number) => {
      const p = toRink(clientX, clientY)
      return Math.hypot(p.x - puck.x, p.y - puck.y) * lay.s <= Math.max(GRAB_PX, PUCK_R * lay.s * 2)
    }
    // Keep a held puck inside the boards, including the rounded corners
    const keepInside = (p: { x: number; y: number }) => {
      const r = PUCK_R
      let x = clamp(p.x, r, L - r)
      let y = clamp(p.y, r, W - r)
      for (const [cx, cy] of [[CR, CR], [L - CR, CR], [L - CR, W - CR], [CR, W - CR]]) {
        const inX = cx < L / 2 ? x < cx : x > cx
        const inY = cy < CY ? y < cy : y > cy
        if (inX && inY) {
          const d = Math.hypot(x - cx, y - cy)
          const lim = CR - r
          if (d > lim) {
            x = cx + ((x - cx) / d) * lim
            y = cy + ((y - cy) / d) * lim
          }
        }
      }
      return { x, y }
    }

    const startUserShot = () => {
      // A new shot ends any goal celebration still showing
      goal = null
      sinceTouch = 0
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      if (nearPuck(e.clientX, e.clientY)) {
        held = { id: e.pointerId, samples: [{ t: performance.now() / 1000, ...toRink(e.clientX, e.clientY) }] }
        goal = null
        puck.vx = puck.vy = 0
        sinceTouch = 0
        canvas.setPointerCapture(e.pointerId)
        canvas.style.cursor = 'grabbing'
      } else if (onIce(toRink(e.clientX, e.clientY))) {
        press = { id: e.pointerId, sx: e.clientX, sy: e.clientY }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (held && e.pointerId === held.id) {
        const p = keepInside(toRink(e.clientX, e.clientY))
        puck.x = p.x
        puck.y = p.y
        const t = performance.now() / 1000
        held.samples.push({ t, ...p })
        held.samples = held.samples.filter((s) => t - s.t <= VELOCITY_WINDOW)
        sinceTouch = 0
        return
      }
      if (press && e.pointerId === press.id && Math.hypot(e.clientX - press.sx, e.clientY - press.sy) > TAP_MAX_MOVE) press = null
      if (e.pointerType === 'mouse') {
        const over = nearPuck(e.clientX, e.clientY)
        if (over !== hoverGrab) {
          hoverGrab = over
          canvas.style.cursor = over ? 'grab' : 'crosshair'
        }
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (held && e.pointerId === held.id) {
        // Release velocity from the last few pointer positions
        const s = held.samples
        const first = s[0]
        const last = s[s.length - 1]
        const dt = last.t - first.t
        let vx = dt > 0.005 ? (last.x - first.x) / dt : 0
        let vy = dt > 0.005 ? (last.y - first.y) / dt : 0
        // A pause before letting go drops the puck in place
        if (performance.now() / 1000 - last.t > 0.12) vx = vy = 0
        const speed = Math.hypot(vx, vy)
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED
          vy = (vy / speed) * MAX_SPEED
        }
        puck.vx = vx
        puck.vy = vy
        puck.spin = (Math.random() - 0.5) * 24
        if (speed > 15) startUserShot()
        held = null
        canvas.style.cursor = 'grab'
        return
      }
      if (press && e.pointerId === press.id) {
        // Tap on the ice: shoot the puck toward that spot
        const target = toRink(e.clientX, e.clientY)
        const dx = target.x - puck.x
        const dy = target.y - puck.y
        const d = Math.hypot(dx, dy)
        if (d > 1) {
          puck.vx = (dx / d) * TAP_SPEED
          puck.vy = (dy / d) * TAP_SPEED
          puck.spin = (Math.random() - 0.5) * 24
          startUserShot()
        }
        press = null
      }
    }

    const onPointerCancel = (e: PointerEvent) => {
      if (held && e.pointerId === held.id) held = null
      if (press && e.pointerId === press.id) press = null
    }

    // On touch screens, stop the page from scrolling only when the finger lands on the puck
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t && nearPuck(t.clientX, t.clientY)) e.preventDefault()
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerCancel)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.style.cursor = 'crosshair'

    // Goalies slide toward where the puck will cross their line, or drift back to center
    const moveGoalies = (dt: number) => {
      for (const g of goalies) {
        const gx = goalieX(g.left)
        g.saveT = Math.max(0, g.saveT - dt)
        const incoming = g.left ? puck.vx < -5 && puck.x > gx : puck.vx > 5 && puck.x < gx
        const onSide = g.left ? puck.x < L / 2 : puck.x > L / 2
        let ty = CY
        if (!goal && incoming && onSide) ty = puck.y + (puck.vy * (gx - puck.x)) / puck.vx
        else if (!goal && onSide) ty = CY + (puck.y - CY) * 0.35
        ty = clamp(ty, CY - GOALIE_RANGE, CY + GOALIE_RANGE)
        const stepY = GOALIE_SPEED * dt
        g.y += clamp(ty - g.y, -stepY, stepY)
      }
    }

    const spray = (x: number, y: number, nx: number, ny: number, strength: number) => {
      if (reduceMotion) return
      const n = Math.min(14, Math.floor(strength / 6))
      for (let i = 0; i < n; i++) {
        const a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.8
        const sp = 8 + Math.random() * strength * 0.35
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35 + Math.random() * 0.35 })
      }
    }

    // Bounce the puck off a surface whose normal (nx, ny) points into the surface
    const reflect = (nx: number, ny: number, e = 0.78) => {
      const vn = puck.vx * nx + puck.vy * ny
      if (vn > 0) {
        puck.vx -= (1 + e) * vn * nx
        puck.vy -= (1 + e) * vn * ny
        spray(puck.x + nx * PUCK_R, puck.y + ny * PUCK_R, -nx, -ny, Math.abs(vn))
        puck.spin += (Math.random() - 0.5) * 10
      }
    }

    const collideGoalies = () => {
      for (const g of goalies) {
        const gx = goalieX(g.left)
        const dx = puck.x - gx
        const dy = puck.y - g.y
        const dist = Math.hypot(dx, dy)
        const min = GOALIE_R + PUCK_R
        if (dist < min && dist > 0) {
          const nx = dx / dist
          const ny = dy / dist
          puck.x = gx + nx * min
          puck.y = g.y + ny * min
          const towardNet = g.left ? puck.vx < 0 : puck.vx > 0
          if (towardNet && Math.hypot(puck.vx, puck.vy) > 25) g.saveT = 0.7
          reflect(-nx, -ny, 0.45)
        }
      }
    }

    const collideBoards = () => {
      const lim = CR - PUCK_R
      for (const [cx, cy] of [[CR, CR], [L - CR, CR], [L - CR, W - CR], [CR, W - CR]]) {
        const inX = cx < L / 2 ? puck.x < cx : puck.x > cx
        const inY = cy < CY ? puck.y < cy : puck.y > cy
        if (inX && inY) {
          const dx = puck.x - cx
          const dy = puck.y - cy
          const d = Math.hypot(dx, dy)
          if (d > lim) {
            const nx = dx / d
            const ny = dy / d
            puck.x = cx + nx * lim
            puck.y = cy + ny * lim
            reflect(nx, ny)
          }
          return
        }
      }
      if (puck.x < PUCK_R) { puck.x = PUCK_R; reflect(-1, 0) }
      if (puck.x > L - PUCK_R) { puck.x = L - PUCK_R; reflect(1, 0) }
      if (puck.y < PUCK_R) { puck.y = PUCK_R; reflect(0, -1) }
      if (puck.y > W - PUCK_R) { puck.y = W - PUCK_R; reflect(0, 1) }
    }

    // Treat the net as a solid box: a puck entering through the open front scores, and a puck hitting any other side bounces off
    const collideNet = (left: boolean, prevX: number) => {
      const gx = left ? GOAL_X : L - GOAL_X
      const backX = left ? gx - NET_DEPTH : gx + NET_DEPTH
      const x0 = Math.min(gx, backX) - PUCK_R
      const x1 = Math.max(gx, backX) + PUCK_R
      const y0 = CY - NET_HALF - PUCK_R
      const y1 = CY + NET_HALF + PUCK_R
      if (puck.x < x0 || puck.x > x1 || puck.y < y0 || puck.y > y1) return

      const fromFront = left ? prevX >= gx : prevX <= gx
      const inMouth = Math.abs(puck.y - CY) < NET_HALF - PUCK_R * 0.4
      if (fromFront && inMouth && (left ? puck.vx < 0 : puck.vx > 0)) {
        goal = { left, t: 0 }
        puck.x = gx + (left ? -1 : 1) * NET_DEPTH * 0.6
        puck.vx *= 0.04
        puck.vy *= 0.04
        return
      }
      const pens = [
        { p: puck.x - x0, nx: 1, ny: 0 },
        { p: x1 - puck.x, nx: -1, ny: 0 },
        { p: puck.y - y0, nx: 0, ny: 1 },
        { p: y1 - puck.y, nx: 0, ny: -1 },
      ]
      pens.sort((a, b) => a.p - b.p)
      const { p, nx, ny } = pens[0]
      puck.x -= nx * p
      puck.y -= ny * p
      reflect(nx, ny, 0.6)
    }

    // Computer play while the visitor is not using the puck: shoot at a random net or pass to a random spot
    const nextPlay = () => {
      let tx: number, ty: number
      if (Math.random() < 0.7) {
        const left = Math.random() < 0.5
        tx = left ? GOAL_X - 1 : L - GOAL_X + 1
        ty = CY + (Math.random() - 0.5) * 9
      } else {
        tx = 20 + Math.random() * (L - 40)
        ty = 8 + Math.random() * (W - 16)
      }
      const dx = tx - puck.x
      const dy = ty - puck.y
      const d = Math.hypot(dx, dy) || 1
      const speed = 55 + Math.random() * 45
      puck.vx = (dx / d) * speed
      puck.vy = (dy / d) * speed
      puck.spin = (Math.random() - 0.5) * 20
    }

    const drawTrail = (x0: number, y0: number, x1: number, y1: number, speed: number) => {
      if (speed <= 1 || reduceMotion) return
      applyRinkTransform(tctx, lay)
      tctx.strokeStyle = `rgba(225, 242, 255, ${Math.min(0.35, speed / 260)})`
      tctx.lineWidth = 0.45
      tctx.lineCap = 'round'
      tctx.beginPath()
      tctx.moveTo(x0, y0)
      tctx.lineTo(x1, y1)
      tctx.stroke()
    }

    let lastHeld = { x: puck.x, y: puck.y }

    const step = (dt: number) => {
      sinceTouch += dt
      if (held) {
        // The puck follows the pointer; goalies still react to it
        drawTrail(lastHeld.x, lastHeld.y, puck.x, puck.y, 60)
        lastHeld = { x: puck.x, y: puck.y }
      } else if (goal) {
        goal.t += dt
        puck.vx *= Math.exp(-6 * dt)
        puck.vy *= Math.exp(-6 * dt)
        puck.x += puck.vx * dt
        puck.y += puck.vy * dt
        if (goal.t > 2.2) {
          goal = null
          puck.x = L / 2
          puck.y = CY
          puck.vx = puck.vy = 0
          clearTrail()
          idle = 0.8
        }
      } else {
        const prevX = puck.x
        const prevY = puck.y
        const sub = 6
        for (let i = 0; i < sub && !goal; i++) {
          const h = dt / sub
          const px = puck.x
          puck.x += puck.vx * h
          puck.y += puck.vy * h
          collideBoards()
          collideNet(true, px)
          if (!goal) collideNet(false, px)
          if (!goal) collideGoalies()
        }
        const friction = Math.exp(-0.32 * dt)
        puck.vx *= friction
        puck.vy *= friction
        const speed = Math.hypot(puck.vx, puck.vy)
        drawTrail(prevX, prevY, puck.x, puck.y, speed)
        lastHeld = { x: puck.x, y: puck.y }

        if (speed < 14 && sinceTouch > DEMO_PAUSE && !reduceMotion) {
          idle -= dt
          if (idle <= 0) {
            nextPlay()
            idle = 0.4 + Math.random() * 1.2
          }
        }
      }

      moveGoalies(dt)
      puck.spin *= Math.exp(-0.5 * dt)

      for (const s of sparks) {
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.vx *= Math.exp(-5 * dt)
        s.vy *= Math.exp(-5 * dt)
        s.life -= dt
      }
      sparks = sparks.filter((s) => s.life > 0)

      // Fade old trail marks in steps a few times a second; tiny per-frame fades round to nothing
      trailFade += dt
      if (trailFade >= 0.2) {
        tctx.setTransform(1, 0, 0, 1, 0, 0)
        tctx.globalCompositeOperation = 'destination-out'
        tctx.fillStyle = 'rgba(0,0,0,0.22)'
        tctx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
        tctx.globalCompositeOperation = 'source-over'
        trailFade = 0
      }
    }

    const render = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(staticCanvas, 0, 0)
      ctx.drawImage(trailCanvas, 0, 0)

      applyRinkTransform(ctx, lay)
      if (goal) drawGoalLight(ctx, goal.left, goal.t, time, reduceMotion)
      for (const g of goalies) drawGoalie(ctx, g)

      for (const s of sparks) {
        ctx.fillStyle = `rgba(240, 250, 255, ${Math.min(1, s.life * 2.2)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 0.22, 0, Math.PI * 2)
        ctx.fill()
      }

      // Faint ring around the puck when it can be grabbed
      if (held || hoverGrab || sinceTouch > DEMO_PAUSE) {
        const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(time / 260)
        ctx.strokeStyle = `rgba(159, 216, 255, ${held ? 0.9 : 0.25 + 0.35 * pulse})`
        ctx.lineWidth = 0.18
        ctx.beginPath()
        ctx.arc(puck.x, puck.y, PUCK_R + 1.2 + (held ? 0 : pulse * 0.8), 0, Math.PI * 2)
        ctx.stroke()
      }
      drawPuck(ctx, puck, time)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      lay = computeLayout(rect.width, rect.height, dpr)
      for (const c of [canvas, staticCanvas, trailCanvas]) {
        c.width = Math.max(1, Math.round(rect.width * dpr))
        c.height = Math.max(1, Math.round(rect.height * dpr))
      }
      drawStatic(sctx, lay)
      // Expose the rink's on-screen size so the hero text can be sized to fit inside it
      const host = canvas.parentElement
      if (host) {
        host.style.setProperty('--rink-w', `${(lay.portrait ? W : L) * lay.s}px`)
        host.style.setProperty('--rink-h', `${(lay.portrait ? L : W) * lay.s}px`)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduceMotion) {
      // No computer play; the puck rests on a faceoff dot until the visitor moves it
      puck.x = GOAL_X + 20
      puck.y = CY - 22
    }

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      step(dt)
      render(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      canvas.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Hockey rink"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
