import {
  BLUE, BLUE_X, CY, GOAL_X, GOALIE_R, L, NET_DEPTH, NET_HALF, PUCK_R, RED, W,
  applyRinkTransform, goalieX, rinkPath,
  type Goalie, type Layout, type Puck,
} from './geometry'

// Top-down goalie facing center ice: pads, body, blocker, glove, stick and helmet
export function drawGoalie(ctx: CanvasRenderingContext2D, g: Goalie) {
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

  // Gold ring under the goalie the player controls
  if (g.player) {
    ctx.strokeStyle = 'rgba(255, 205, 80, 0.85)'
    ctx.lineWidth = 0.2
    ctx.setLineDash([0.6, 0.5])
    ctx.beginPath()
    ctx.arc(x, y, GOALIE_R + 0.9, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Brief ring after a save
  if (g.saveT > 0) {
    ctx.strokeStyle = `rgba(190, 230, 255, ${g.saveT * 1.2})`
    ctx.lineWidth = 0.25
    ctx.beginPath()
    ctx.arc(x, y, GOALIE_R + (0.7 - g.saveT) * 5, 0, Math.PI * 2)
    ctx.stroke()
  }
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

export function drawStatic(ctx: CanvasRenderingContext2D, lay: Layout) {
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

// Goal light: red glow behind the scoring net. `t` is seconds since the goal.
export function drawGoalLight(ctx: CanvasRenderingContext2D, left: boolean, t: number, time: number, steady: boolean) {
  const gx = left ? 0 : L
  const pulse = steady ? 0.8 : 0.55 + 0.45 * Math.sin(time / 90)
  const fade = Math.max(0, Math.min(1, (2.2 - t) * 1.5))
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

// Puck: motion blur, spotlight halo, shadow, body, rim highlight and spinning grip texture
export function drawPuck(ctx: CanvasRenderingContext2D, puck: Puck, time: number) {
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
