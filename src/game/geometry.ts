// Rink geometry in feet, using NHL dimensions.
// x runs along the length (0 to 200), y across the width (0 to 85).
export const L = 200
export const W = 85
export const CR = 28 // corner radius
export const CY = W / 2
export const GOAL_X = 11 // goal line distance from end boards
export const BLUE_X = 75 // blue line distance from end boards
export const NET_HALF = 3 // nets are 6 ft wide
export const NET_DEPTH = 3.4
export const PUCK_R = 1.1 // drawn larger than a real puck (0.125 ft) so it is visible

export const GOALIE_R = 1.9 // collision radius of the goalie's body and pads
export const GOALIE_OFFSET = 2.4 // distance in front of the goal line
export const GOALIE_SPEED = 12 // ft/s side-to-side for computer goalies
export const GOALIE_RANGE = 3.4 // how far from center a goalie can slide

// The player defends the right net (bottom net on phones)
export const PLAYER_LEFT = false
export const PLAYER_GOAL_X = L - GOAL_X

export const RED = 'rgba(225, 45, 57, 0.78)'
export const BLUE = 'rgba(46, 116, 245, 0.8)'

export type Layout = { s: number; ox: number; oy: number; portrait: boolean; dpr: number; w: number; h: number }
export type Insets = { top: number; bottom: number }
export type Spark = { x: number; y: number; vx: number; vy: number; life: number }
export type Goalie = { left: boolean; y: number; saveT: number; player: boolean }
export type Puck = { x: number; y: number; vx: number; vy: number; spin: number }

export function goalieX(left: boolean) {
  return left ? GOAL_X + GOALIE_OFFSET : L - GOAL_X - GOALIE_OFFSET
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// Fit the rink in the canvas. Without insets the padding leaves room for the hero's dock and footer.
export function computeLayout(w: number, h: number, dpr: number, insets?: Insets): Layout {
  const portrait = h > w * 1.05
  const padX = Math.max(16, w * 0.04)
  const top = insets ? insets.top : portrait ? 70 : Math.max(84, h * 0.1)
  const bottom = insets ? insets.bottom : top
  const aw = Math.max(10, w - padX * 2)
  const ah = Math.max(10, h - top - bottom)
  const s = portrait ? Math.min(aw / W, ah / L) : Math.min(aw / L, ah / W)
  const rw = (portrait ? W : L) * s
  const rh = (portrait ? L : W) * s
  return { s, ox: (w - rw) / 2, oy: top + (ah - rh) / 2, portrait, dpr, w, h }
}

// Map rink feet to device pixels. In portrait, swap the axes so the rink is drawn vertically.
export function applyRinkTransform(ctx: CanvasRenderingContext2D, lay: Layout) {
  const k = lay.s * lay.dpr
  if (lay.portrait) ctx.setTransform(0, k, k, 0, lay.ox * lay.dpr, lay.oy * lay.dpr)
  else ctx.setTransform(k, 0, 0, k, lay.ox * lay.dpr, lay.oy * lay.dpr)
}

export function rinkPath(ctx: CanvasRenderingContext2D, inset = 0) {
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
