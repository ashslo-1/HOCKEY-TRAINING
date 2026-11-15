import { useEffect, useRef } from 'react'

// All rink geometry is in feet, using NHL dimensions.
// x runs along the length (0 → 200), y across the width (0 → 85).
const L = 200
const W = 85
const CR = 28 // corner radius
const CY = W / 2
const GOAL_X = 11 // goal line distance from end boards
const BLUE_X = 75 // blue line distance from end boards
const NET_HALF = 3 // nets are 6 ft wide
const NET_DEPTH = 3.4
const PUCK_R = 1.1 // drawn larger than a real puck (0.125 ft) so it is visible

const RED = 'rgba(225, 45, 57, 0.78)'
const BLUE = 'rgba(46, 116, 245, 0.8)'

type Layout = { s: number; ox: number; oy: number; portrait: boolean; dpr: number; w: number; h: number }
type Spark = { x: number; y: number; vx: number; vy: number; life: number }
type Goalie = { left: boolean; y: number; saveT: number }

const GOALIE_R = 1.9 // collision radius of the goalie's body and pads
const GOALIE_OFFSET = 2.4 // distance in front of the goal line
const GOALIE_SPEED = 12 // ft/s side-to-side
const GOALIE_RANGE = 3.4 // how far from center the goalie can slide

function goalieX(left: boolean) {
  return left ? GOAL_X + GOALIE_OFFSET : L - GOAL_X - GOALIE_OFFSET
}

// Top-down goalie facing center ice: pads, body, blocker, glove, stick and helmet
function drawGoalie(ctx: CanvasRenderingContext2D, g: Goalie) {
  const x = goalieX(g.left)
  const y = g.y
  const d = g.left ? 1 : -1

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  ctx.ellipse(x + 0.3, y + 0.3, 1.6, 2.3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stick: shaft from the blocker hand, paddle flat on the ice in front of the pads
  ctx.strokeStyle = '#d9c7a3'
  ctx.lineCap = 'round'
  ctx.lineWidth = 0.28
  ctx.beginPath()
  ctx.moveTo(x - d * 0.2, y + 1.7)
  ctx.lineTo(x + d * 1.5, y + 0.4)
  ctx.stroke()
  ctx.strokeStyle = '#f1f1f1'
  ctx.lineWidth = 0.4
  ctx.beginPath()
  ctx.moveTo(x + d * 1.5, y + 0.4)
  ctx.lineTo(x + d * 1.55, y - 1.0)
  ctx.stroke()

  // Leg pads
  ctx.fillStyle = '#f4f6f8'
  ctx.strokeStyle = 'rgba(20, 40, 90, 0.9)'
  ctx.lineWidth = 0.12
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.roundRect(x + (d > 0 ? 0.2 : -1.2), y + side * 0.55 - (side > 0 ? 0 : 1.1), 1.0, 1.1, 0.25)
    ctx.fill()
    ctx.stroke()
  }

  // Body and shoulders
  ctx.fillStyle = '#1f3c88'
  ctx.beginPath()
  ctx.ellipse(x - d * 0.2, y, 1.0, 1.75, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 0.14
  ctx.stroke()

  // Blocker (rectangle) on the stick side, glove (circle) on the other
  ctx.fillStyle = '#f4f6f8'
  ctx.beginPath()
  ctx.roundRect(x - 0.45, y + 1.45, 0.9, 0.6, 0.15)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + d * 0.1, y - 1.75, 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(20, 40, 90, 0.9)'
  ctx.lineWidth = 0.1
  ctx.stroke()

  // Helmet with cage facing the play
  ctx.fillStyle = '#e8ecf0'
  ctx.beginPath()
  ctx.arc(x - d * 0.25, y, 0.62, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 40, 40, 0.7)'
  ctx.lineWidth = 0.06
  ctx.beginPath()
  for (const o of [-0.3, 0, 0.3]) {
    ctx.moveTo(x + d * 0.05, y + o)
    ctx.lineTo(x + d * 0.35, y + o)
  }
  ctx.stroke()

  // Brief ring after a save
  if (g.saveT > 0) {
    ctx.strokeStyle = `rgba(190, 230, 255, ${g.saveT * 1.2})`
    ctx.lineWidth = 0.25
    ctx.beginPath()
    ctx.arc(x, y, GOALIE_R + (0.7 - g.saveT) * 5, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function computeLayout(w: number, h: number, dpr: number): Layout {
  const portrait = h > w * 1.05
  const padX = Math.max(16, w * 0.04)
  // Leave room for the dock and footer. Phones get less padding so the rink is as large as possible.
  const padY = portrait ? 70 : Math.max(84, h * 0.1)
  const aw = w - padX * 2
  const ah = h - padY * 2
  const s = portrait ? Math.min(aw / W, ah / L) : Math.min(aw / L, ah / W)
  const rw = (portrait ? W : L) * s
  const rh = (portrait ? L : W) * s
  return { s, ox: (w - rw) / 2, oy: (h - rh) / 2, portrait, dpr, w, h }
}

// Map rink feet to device pixels. In portrait, swap the axes so the rink is drawn vertically.
function applyRinkTransform(ctx: CanvasRenderingContext2D, lay: Layout) {
  const k = lay.s * lay.dpr
  if (lay.portrait) ctx.setTransform(0, k, k, 0, lay.ox * lay.dpr, lay.oy * lay.dpr)
  else ctx.setTransform(k, 0, 0, k, lay.ox * lay.dpr, lay.oy * lay.dpr)
}

function rinkPath(ctx: CanvasRenderingContext2D, inset = 0) {
  const r = CR - inset
  ctx.beginPath()
  ctx.moveTo(CR, inset)
  ctx.lineTo(L - CR, inset)
  ctx.arc(L - CR, CR, r, -Math.PI / 2, 0)
  ctx.lineTo(L - inset, W - CR)
  ctx.arc(L - CR, W - CR, r, 0, Math.PI / 2)
  ctx.lineTo(CR, W - inset)
  ctx.arc(CR, W - CR, r, Math.PI / 2, Math.PI)
  ctx.lineTo(inset, CR)
  ctx.arc(CR, CR, r, Math.PI, Math.PI * 1.5)
  ctx.closePath()
}

// Small deterministic PRNG so the ice texture is the same on every resize.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function drawFaceoffCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = RED
  ctx.lineWidth = 0.32
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.stroke()
  // Hash marks on the sides of the circle that face the side boards
  ctx.beginPath()
  for (const sy of [-1, 1]) {
    const edgeY = cy + sy * Math.sqrt(15 * 15 - 2.96 * 2.96)
    for (const sx of [-1, 1]) {
      ctx.moveTo(cx + sx * 2.96, edgeY)
      ctx.lineTo(cx + sx * 2.96, edgeY + sy * 2)
    }
  }
  // L-shaped marks around the dot
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      ctx.moveTo(cx + sx * 6, cy + sy * 0.75)
      ctx.lineTo(cx + sx * 2, cy + sy * 0.75)
      ctx.lineTo(cx + sx * 2, cy + sy * 3.75)
    }
  }
  ctx.stroke()
  drawDot(ctx, cx, cy)
}

function drawDot(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(cx, cy, 1, 0, Math.PI * 2)
  ctx.fill()
}

function drawGoalEnd(ctx: CanvasRenderingContext2D, left: boolean) {
  const gx = left ? GOAL_X : L - GOAL_X
  const dir = left ? 1 : -1 // direction toward center ice
  const endX = left ? 0 : L

  // Crease
  ctx.fillStyle = 'rgba(80, 170, 255, 0.22)'
  ctx.strokeStyle = RED
  ctx.lineWidth = 0.18
  ctx.beginPath()
  ctx.moveTo(gx, CY - 6)
  ctx.arc(gx, CY, 6, -Math.PI / 2, Math.PI / 2, !left)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Goal line
  ctx.lineWidth = 0.22
  ctx.beginPath()
  ctx.moveTo(gx, 0)
  ctx.lineTo(gx, W)
  ctx.stroke()

  // Goalie trapezoid behind the net
  ctx.lineWidth = 0.18
  ctx.beginPath()
  ctx.moveTo(gx, CY - 11)
  ctx.lineTo(endX, CY - 14)
  ctx.moveTo(gx, CY + 11)
  ctx.lineTo(endX, CY + 14)
  ctx.stroke()

  // Net
  const nx = gx - dir * NET_DEPTH
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.lineWidth = 0.1
  ctx.beginPath()
  ctx.rect(Math.min(gx, nx), CY - NET_HALF, NET_DEPTH, NET_HALF * 2)
  ctx.fill()
  ctx.beginPath()
  for (let i = 0.6; i < NET_HALF * 2; i += 0.6) {
    ctx.moveTo(gx, CY - NET_HALF + i)
    ctx.lineTo(nx, CY - NET_HALF + i)
  }
  for (let i = 0.6; i < NET_DEPTH; i += 0.6) {
    ctx.moveTo(gx - dir * i, CY - NET_HALF)
    ctx.lineTo(gx - dir * i, CY + NET_HALF)
  }
  ctx.stroke()
  ctx.strokeStyle = 'rgba(235, 50, 60, 0.95)'
  ctx.lineWidth = 0.35
  ctx.beginPath()
  ctx.moveTo(gx, CY - NET_HALF)
  ctx.lineTo(nx, CY - NET_HALF)
  ctx.lineTo(nx, CY + NET_HALF)
  ctx.lineTo(gx, CY + NET_HALF)
  ctx.stroke()

  // Faceoff circles
  const fx = gx + dir * 20
  drawFaceoffCircle(ctx, fx, CY - 22)
  drawFaceoffCircle(ctx, fx, CY + 22)
}

function drawStatic(ctx: CanvasRenderingContext2D, lay: Layout) {
  const { w, h, dpr } = lay
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w * dpr, h * dpr)

  // Arena background: dark fill with a lighter radial gradient centered on the rink
  ctx.fillStyle = '#04080c'
  ctx.fillRect(0, 0, w * dpr, h * dpr)
  const spot = ctx.createRadialGradient(w * dpr / 2, h * dpr / 2, 0, w * dpr / 2, h * dpr / 2, Math.max(w, h) * dpr * 0.7)
  spot.addColorStop(0, 'rgba(70, 120, 160, 0.28)')
  spot.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = spot
  ctx.fillRect(0, 0, w * dpr, h * dpr)

  applyRinkTransform(ctx, lay)

  // Outer glow of the boards
  ctx.save()
  ctx.shadowColor = 'rgba(140, 200, 255, 0.35)'
  ctx.shadowBlur = 40 * dpr
  rinkPath(ctx, -1.2)
  ctx.fillStyle = 'rgba(200, 225, 245, 0.9)'
  ctx.fill()
  ctx.restore()

  // Ice surface
  ctx.save()
  rinkPath(ctx)
  ctx.clip()
  const ice = ctx.createRadialGradient(L / 2, CY, 4, L / 2, CY, 115)
  ice.addColorStop(0, '#5b7f98')
  ice.addColorStop(0.55, '#3c5d74')
  ice.addColorStop(1, '#1d3446')
  ctx.fillStyle = ice
  ctx.fillRect(0, 0, L, W)

  // Skate scratches and frost speckle
  const rand = mulberry32(7)
  ctx.lineCap = 'round'
  for (let i = 0; i < 420; i++) {
    const x = rand() * L
    const y = rand() * W
    const a = rand() * Math.PI
    const len = 1.5 + rand() * 9
    ctx.strokeStyle = `rgba(220, 240, 255, ${0.03 + rand() * 0.07})`
    ctx.lineWidth = 0.05 + rand() * 0.12
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (rand() - 0.5) * 2, y + Math.sin(a) * len * 0.5 + (rand() - 0.5) * 2, x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${rand() * 0.08})`
    ctx.fillRect(rand() * L, rand() * W, 0.15, 0.15)
  }

  // Blur the markings slightly, as if painted under the ice
  ctx.shadowBlur = 6 * dpr
  ctx.shadowColor = 'rgba(0, 0, 0, 0)'

  // Blue lines
  ctx.fillStyle = BLUE
  ctx.shadowColor = 'rgba(46, 116, 245, 0.6)'
  ctx.fillRect(BLUE_X - 0.5, 0, 1, W)
  ctx.fillRect(L - BLUE_X - 0.5, 0, 1, W)

  // Center red line with a lighter checker inside
  ctx.shadowColor = 'rgba(225, 45, 57, 0.6)'
  ctx.fillStyle = RED
  ctx.fillRect(L / 2 - 0.5, 0, 1, W)
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
  for (let y = 0; y < W; y += 2.4) ctx.fillRect(L / 2 - 0.2, y, 0.4, 1.2)

  // Center circle and dot
  ctx.shadowColor = 'rgba(46, 116, 245, 0.6)'
  ctx.strokeStyle = BLUE
  ctx.lineWidth = 0.32
  ctx.beginPath()
  ctx.arc(L / 2, CY, 15, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = BLUE
  ctx.beginPath()
  ctx.arc(L / 2, CY, 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowColor = 'rgba(225, 45, 57, 0.5)'
  // Neutral zone dots
  for (const x of [BLUE_X - 5, L - BLUE_X + 5]) {
    drawDot(ctx, x, CY - 22)
    drawDot(ctx, x, CY + 22)
  }

  // Referee crease on the near side boards
  ctx.strokeStyle = RED
  ctx.lineWidth = 0.18
  ctx.beginPath()
  ctx.arc(L / 2, W, 10, Math.PI, 0)
  ctx.stroke()

  drawGoalEnd(ctx, true)
  drawGoalEnd(ctx, false)

  // Darken the ice toward the boards so the center looks brighter
  ctx.shadowColor = 'rgba(0,0,0,0)'
  const vignette = ctx.createRadialGradient(L / 2, CY, 30, L / 2, CY, 120)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0, 8, 16, 0.4)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, L, W)
  ctx.restore()

  // Dasher boards
  rinkPath(ctx)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 0.9
  ctx.stroke()
  rinkPath(ctx, -0.9)
  ctx.strokeStyle = 'rgba(255, 210, 80, 0.7)' // kick plate trim
  ctx.lineWidth = 0.35
  ctx.stroke()
}

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
    const puck = { x: L / 2, y: CY, vx: 0, vy: 0, spin: 0 }
    let sparks: Spark[] = []
    let idle = 0.9 // seconds until the next shot or pass
    let goal: { left: boolean; t: number } | null = null
    const goalies: Goalie[] = [
      { left: true, y: CY, saveT: 0 },
      { left: false, y: CY, saveT: 0 },
    ]

    // Slide toward where the puck will cross the goalie's line, or drift back to center
    const moveGoalies = (dt: number) => {
      for (const g of goalies) {
        const gx = goalieX(g.left)
        const incoming = g.left ? puck.vx < -5 && puck.x > gx : puck.vx > 5 && puck.x < gx
        const onSide = g.left ? puck.x < L / 2 : puck.x > L / 2
        let ty = CY
        if (!goal && incoming && onSide) ty = puck.y + (puck.vy * (gx - puck.x)) / puck.vx
        else if (!goal && onSide) ty = CY + (puck.y - CY) * 0.35
        ty = Math.max(CY - GOALIE_RANGE, Math.min(CY + GOALIE_RANGE, ty))
        const step = GOALIE_SPEED * dt
        g.y += Math.max(-step, Math.min(step, ty - g.y))
        g.saveT = Math.max(0, g.saveT - dt)
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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      lay = computeLayout(rect.width, rect.height, dpr)
      for (const c of [canvas, staticCanvas, trailCanvas]) {
        c.width = Math.round(rect.width * dpr)
        c.height = Math.round(rect.height * dpr)
      }
      drawStatic(sctx, lay)
      // Expose the rink's on-screen size so the hero text can be sized to fit inside it
      const host = canvas.parentElement
      if (host) {
        host.style.setProperty('--rink-w', `${(lay.portrait ? W : L) * lay.s}px`)
        host.style.setProperty('--rink-h', `${(lay.portrait ? L : W) * lay.s}px`)
      }
      if (reduceMotion) render(0)
    }

    const spray = (x: number, y: number, nx: number, ny: number, strength: number) => {
      const n = Math.min(14, Math.floor(strength / 6))
      for (let i = 0; i < n; i++) {
        const a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.8
        const sp = 8 + Math.random() * strength * 0.35
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35 + Math.random() * 0.35 })
      }
    }

    // Shoot at a random net, or pass to a random spot on the ice
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

    const reflect = (nx: number, ny: number, e = 0.78) => {
      const vn = puck.vx * nx + puck.vy * ny
      if (vn > 0) {
        puck.vx -= (1 + e) * vn * nx
        puck.vy -= (1 + e) * vn * ny
        spray(puck.x + nx * PUCK_R, puck.y + ny * PUCK_R, -nx, -ny, Math.abs(vn))
        puck.spin += (Math.random() - 0.5) * 10
      }
    }

    const collideBoards = () => {
      const lim = CR - PUCK_R
      const corners = [
        [CR, CR], [L - CR, CR], [L - CR, W - CR], [CR, W - CR],
      ]
      for (const [cx, cy] of corners) {
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

    // Treat the net as a solid box: a puck entering through the open front scores, and a puck hitting any other side bounces off.
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

    const step = (dt: number) => {
      if (goal) {
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
          tctx.setTransform(1, 0, 0, 1, 0, 0)
          tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
          idle = 0.8
        }
      } else {
        const prevX = puck.x
        const prevY = puck.y
        const sub = 4
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

        // Draw the puck's path onto the trail canvas
        const speed = Math.hypot(puck.vx, puck.vy)
        if (speed > 1) {
          applyRinkTransform(tctx, lay)
          tctx.strokeStyle = `rgba(225, 242, 255, ${Math.min(0.35, speed / 260)})`
          tctx.lineWidth = 0.45
          tctx.lineCap = 'round'
          tctx.beginPath()
          tctx.moveTo(prevX, prevY)
          tctx.lineTo(puck.x, puck.y)
          tctx.stroke()
        }

        if (speed < 14) {
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

      // Fade old trail marks
      tctx.setTransform(1, 0, 0, 1, 0, 0)
      tctx.globalCompositeOperation = 'destination-out'
      tctx.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 0.9)})`
      tctx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
      tctx.globalCompositeOperation = 'source-over'
    }

    const render = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(staticCanvas, 0, 0)
      ctx.drawImage(trailCanvas, 0, 0)

      applyRinkTransform(ctx, lay)

      // Goal light: red glow pulsing behind the scoring net
      if (goal) {
        const gx = goal.left ? 0 : L
        const pulse = 0.55 + 0.45 * Math.sin(time / 90)
        const fade = Math.min(1, (2.2 - goal.t) * 1.5)
        const g = ctx.createRadialGradient(gx, CY, 0, gx, CY, 45)
        g.addColorStop(0, `rgba(255, 40, 40, ${0.55 * pulse * fade})`)
        g.addColorStop(1, 'rgba(255, 40, 40, 0)')
        ctx.save()
        rinkPath(ctx)
        ctx.clip()
        ctx.fillStyle = g
        ctx.fillRect(0, 0, L, W)
        ctx.restore()
      }

      for (const g of goalies) drawGoalie(ctx, g)

      // Ice spray
      for (const s of sparks) {
        ctx.fillStyle = `rgba(240, 250, 255, ${Math.min(1, s.life * 2.2)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 0.22, 0, Math.PI * 2)
        ctx.fill()
      }

      // Motion blur: faded copies of the puck behind it when moving fast
      const speed = Math.hypot(puck.vx, puck.vy)
      if (speed > 20) {
        for (let i = 1; i <= 4; i++) {
          const k = i * 0.012
          ctx.fillStyle = `rgba(10, 14, 18, ${0.18 / i})`
          ctx.beginPath()
          ctx.arc(puck.x - puck.vx * k, puck.y - puck.vy * k, PUCK_R, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Puck: spotlight halo, shadow, body, rim highlight
      const halo = ctx.createRadialGradient(puck.x, puck.y, PUCK_R, puck.x, puck.y, PUCK_R * 4.5)
      halo.addColorStop(0, 'rgba(210, 235, 255, 0.35)')
      halo.addColorStop(1, 'rgba(210, 235, 255, 0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(puck.x, puck.y, PUCK_R * 4.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.beginPath()
      ctx.arc(puck.x + 0.35, puck.y + 0.35, PUCK_R * 1.08, 0, Math.PI * 2)
      ctx.fill()

      const body = ctx.createRadialGradient(puck.x - 0.3, puck.y - 0.3, 0.1, puck.x, puck.y, PUCK_R)
      body.addColorStop(0, '#3a3f45')
      body.addColorStop(1, '#0a0c0e')
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.lineWidth = 0.12
      ctx.stroke()

      // Grip texture that rotates with the spin
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 0.08
      const rot = (time / 1000) * puck.spin
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI) / 3
        ctx.moveTo(puck.x + Math.cos(a) * PUCK_R * 0.35, puck.y + Math.sin(a) * PUCK_R * 0.35)
        ctx.lineTo(puck.x + Math.cos(a) * PUCK_R * 0.8, puck.y + Math.sin(a) * PUCK_R * 0.8)
      }
      ctx.stroke()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduceMotion) {
      puck.x = GOAL_X + 20
      puck.y = CY - 22
      render(0)
      return () => ro.disconnect()
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
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
