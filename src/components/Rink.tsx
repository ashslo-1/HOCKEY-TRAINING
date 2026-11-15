import { useEffect, useRef } from 'react'
import {
  CR, CY, GOAL_X, GOALIE_R, GOALIE_RANGE, GOALIE_SPEED, L, NET_DEPTH, NET_HALF, PLAYER_GOAL_X, PLAYER_LEFT, PUCK_R, W,
  applyRinkTransform, clamp, computeLayout, goalieX,
  type Goalie, type Insets, type Puck, type Spark,
} from '../game/geometry'
import { drawAim, drawGoalie, drawGoalLight, drawPuck, drawStatic, drawWindupRing } from '../game/draw'
import { DIFFICULTY, SHOTS_PER_ROUND, SURVIVAL_GOALS, SURVIVAL_RAMP_SCALE, savePoints, type GameSettings } from '../game/config'
import type { GameEvent, GameStatus, ShotKind, ShotResult } from '../game/types'

type RinkProps = {
  playing?: boolean // true while a round is running; false shows the computer-only demo
  paused?: boolean // freezes the round in place
  round?: number // increment to start a new round
  settings?: GameSettings // read when a round starts
  insets?: Insets // space in px to keep clear above and below the rink
  onUpdate?: (status: GameStatus) => void
  onEvent?: (event: GameEvent) => void
}

const DEFAULT_SETTINGS: GameSettings = { mode: 'challenge', difficulty: 'medium' }
const TOUCH_PX_PER_FT = 12 // finger travel in px that moves the goalie one foot
const SAVE_CONFIRM = 0.2 // seconds after contact before a save is counted, in case the puck trickles in

type Phase = 'off' | 'setup' | 'windup' | 'pass' | 'shot' | 'rebound' | 'resolved' | 'done'

export default function Rink(props: RinkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resizeRef = useRef<() => void>(() => {})
  // The animation loop reads the latest props from this ref, so the main effect never restarts
  const propsRef = useRef(props)
  useEffect(() => {
    propsRef.current = props
  })

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
    const playerGoalie = goalies.find((g) => g.left === PLAYER_LEFT)!

    const game = {
      phase: 'off' as Phase,
      settings: DEFAULT_SETTINGS,
      t: 0,
      round: -1,
      shot: 0,
      saves: 0,
      goals: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      last: null as ShotResult | null,
      lastId: 0,
      lastPoints: 0,
      kind: null as ShotKind | null,
      passTo: null as { x: number; y: number } | null,
      target: { x: PLAYER_GOAL_X + 1, y: CY },
      windup: 1,
      savedAt: null as number | null,
    }
    let aimY: number | null = null // where the player wants the goalie, in rink feet
    let keyDir = 0 // -1, 0 or 1 while an arrow key is held
    let touchFrom: number | null = null // last finger position across the ice, in px

    const active = () => game.phase !== 'off'
    const paused = () => !!propsRef.current.paused
    const tuning = () => DIFFICULTY[game.settings.difficulty]
    const rampShots = () => game.shot * (game.settings.mode === 'survival' ? SURVIVAL_RAMP_SCALE : 1)
    const fire = (e: GameEvent) => {
      if (active()) propsRef.current.onEvent?.(e)
    }

    const emit = () => {
      propsRef.current.onUpdate?.({
        phase: game.phase === 'done' ? 'done' : 'playing',
        mode: game.settings.mode,
        difficulty: game.settings.difficulty,
        shot: game.shot,
        saves: game.saves,
        goals: game.goals,
        total: game.settings.mode === 'challenge' ? SHOTS_PER_ROUND : null,
        score: game.score,
        streak: game.streak,
        bestStreak: game.bestStreak,
        last: game.last,
        lastId: game.lastId,
        lastPoints: game.lastPoints,
        incoming: game.kind,
      })
    }

    const clearTrail = () => {
      tctx.setTransform(1, 0, 0, 1, 0, 0)
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
    }

    const startRound = () => {
      Object.assign(game, {
        phase: 'setup', settings: propsRef.current.settings ?? DEFAULT_SETTINGS, t: 0, shot: 0, saves: 0, goals: 0, score: 0,
        streak: 0, bestStreak: 0, last: null, lastPoints: 0, kind: null, passTo: null, savedAt: null,
      })
      goal = null
      playerGoalie.player = true
      playerGoalie.y = CY
      aimY = null
      touchFrom = null
      clearTrail()
      emit()
    }

    const stopRound = () => {
      game.phase = 'off'
      game.kind = null
      playerGoalie.player = false
      goal = null
      idle = 0.5
    }

    const pickTarget = () => {
      game.target = { x: PLAYER_GOAL_X + 1, y: CY + (Math.random() * 2 - 1) * (NET_HALF - 0.9) }
    }

    const shoot = () => {
      const tu = tuning()
      const dx = game.target.x - puck.x
      const dy = game.target.y - puck.y
      const d = Math.hypot(dx, dy) || 1
      const speed = tu.shotSpeed + Math.min(tu.maxRamp, tu.ramp * rampShots()) + Math.random() * tu.shotSpeedRandom
      puck.vx = (dx / d) * speed
      puck.vy = (dy / d) * speed
      puck.spin = (Math.random() - 0.5) * 24
      game.phase = 'shot'
      game.t = 0
      game.savedAt = null
      fire('shot')
    }

    const roundOver = () =>
      game.settings.mode === 'challenge' ? game.shot >= SHOTS_PER_ROUND : game.goals >= SURVIVAL_GOALS

    const resolveShot = (result: ShotResult) => {
      game.last = result
      game.lastId += 1
      game.lastPoints = 0
      game.t = 0
      if (result === 'wide') {
        game.phase = 'resolved'
        game.kind = null
        fire('wide')
        emit()
        return
      }
      const wasRebound = game.kind === 'rebound'
      game.shot += 1
      if (result === 'save') {
        game.saves += 1
        game.streak += 1
        game.bestStreak = Math.max(game.bestStreak, game.streak)
        if (game.settings.mode === 'challenge') {
          game.lastPoints = savePoints(game.streak, wasRebound)
          game.score += game.lastPoints
        } else {
          game.score = game.saves
        }
      } else {
        game.goals += 1
        game.streak = 0
      }
      game.kind = null
      // A save can be followed by a quick second shot at the loose puck, unless the play was already a rebound
      game.phase = result === 'save' && !wasRebound && !roundOver() && Math.random() < tuning().reboundChance ? 'rebound' : 'resolved'
      if (game.phase === 'rebound') game.kind = 'rebound'
      emit()
    }

    // Runs once per frame while a round is active
    const stepGame = (dt: number) => {
      game.t += dt
      const tu = tuning()
      switch (game.phase) {
        case 'setup': {
          // Place the puck somewhere in the player's defensive zone, then wind up
          puck.x = PLAYER_GOAL_X - (26 + Math.random() * 40)
          puck.y = 10 + Math.random() * (W - 20)
          puck.vx = puck.vy = 0
          game.passTo = Math.random() < tu.passChance
            ? { x: PLAYER_GOAL_X - (18 + Math.random() * 16), y: puck.y < CY ? CY + 8 + Math.random() * 14 : CY - 8 - Math.random() * 14 }
            : null
          game.kind = game.passTo ? 'pass' : 'shot'
          game.windup = Math.max(tu.windupMin, tu.windup - tu.windupRamp * rampShots())
          pickTarget()
          game.phase = 'windup'
          game.t = 0
          emit()
          break
        }
        case 'windup':
          if (game.t > game.windup) {
            if (game.passTo) {
              const dx = game.passTo.x - puck.x
              const dy = game.passTo.y - puck.y
              const d = Math.hypot(dx, dy) || 1
              puck.vx = (dx / d) * 80
              puck.vy = (dy / d) * 80
              game.phase = 'pass'
              game.t = 0
              fire('pass')
            } else {
              shoot()
            }
          }
          break
        case 'pass':
          if (!game.passTo || Math.hypot(game.passTo.x - puck.x, game.passTo.y - puck.y) < 2.5 || game.t > 1.5) shoot()
          break
        case 'shot':
          if (goal && goal.left === PLAYER_LEFT) resolveShot('goal')
          else if (game.savedAt !== null && game.t - game.savedAt > SAVE_CONFIRM) resolveShot('save')
          // Missed the net or bounced off the frame: retake without counting it
          else if (game.savedAt === null && (game.t > 3 || (game.t > 0.3 && puck.vx < 0) || (game.t > 0.5 && Math.hypot(puck.vx, puck.vy) < 6))) resolveShot('wide')
          break
        case 'rebound': {
          // A second shooter collects the loose puck if it stays in front of the net
          const dx = PLAYER_GOAL_X - puck.x
          const inSlot = dx > 10 && dx < 50 && Math.abs(puck.y - CY) < 28
          if (game.t > 0.45 && inSlot && Math.hypot(puck.vx, puck.vy) < 60) {
            puck.vx *= 0.1
            puck.vy *= 0.1
            game.passTo = null
            game.windup = tu.reboundWindup
            pickTarget()
            game.phase = 'windup'
            game.t = 0
          } else if (game.t > 1.4) {
            game.kind = null
            game.phase = 'setup'
            emit()
          }
          break
        }
        case 'resolved':
          if (game.t > (game.last === 'wide' ? 0.7 : 1.1)) {
            goal = null
            if (game.last !== 'wide' && roundOver()) {
              game.phase = 'done'
              puck.vx = puck.vy = 0
              emit()
            } else {
              game.phase = 'setup'
            }
          }
          break
      }
    }

    // Mouse: the goalie follows the pointer. Touch: dragging moves the goalie by the distance dragged.
    const acrossPx = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return lay.portrait ? e.clientX - rect.left : e.clientY - rect.top
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!active() || paused()) return
      if (e.pointerType === 'mouse') {
        aimY = (acrossPx(e) - (lay.portrait ? lay.ox : lay.oy)) / lay.s
      } else if (touchFrom !== null) {
        const px = acrossPx(e)
        aimY = clamp((aimY ?? playerGoalie.y) + (px - touchFrom) / TOUCH_PX_PER_FT, CY - GOALIE_RANGE, CY + GOALIE_RANGE)
        touchFrom = px
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!active()) return
      if (e.pointerType === 'mouse') onPointerMove(e)
      else touchFrom = acrossPx(e)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') touchFrom = null
    }
    const keyMap: Record<string, number> = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }
    const onKeyDown = (e: KeyboardEvent) => {
      if (!active() || !(e.key in keyMap)) return
      e.preventDefault()
      if (paused()) return
      keyDir = keyMap[e.key]
      if (aimY === null) aimY = playerGoalie.y
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.key] === keyDir) keyDir = 0
    }
    const onBlur = () => {
      keyDir = 0
      touchFrom = null
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    // Computer goalies slide toward where the puck will cross their line, or drift back to center
    const moveGoalies = (dt: number) => {
      const playerSpeed = tuning().goalieSpeed
      if (keyDir !== 0 && aimY !== null) aimY += keyDir * playerSpeed * dt
      for (const g of goalies) {
        const gx = goalieX(g.left)
        g.saveT = Math.max(0, g.saveT - dt)
        if (g.player) {
          if (aimY !== null) aimY = clamp(aimY, CY - GOALIE_RANGE - 2, CY + GOALIE_RANGE + 2)
          const ty = clamp(aimY ?? CY, CY - GOALIE_RANGE, CY + GOALIE_RANGE)
          const stepY = playerSpeed * dt
          g.y += clamp(ty - g.y, -stepY, stepY)
          continue
        }
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

    // Bounce the puck off a surface whose normal (nx, ny) points into the surface. Returns the impact speed.
    const reflect = (nx: number, ny: number, e = 0.78) => {
      const vn = puck.vx * nx + puck.vy * ny
      if (vn > 0) {
        puck.vx -= (1 + e) * vn * nx
        puck.vy -= (1 + e) * vn * ny
        spray(puck.x + nx * PUCK_R, puck.y + ny * PUCK_R, -nx, -ny, Math.abs(vn))
        puck.spin += (Math.random() - 0.5) * 10
        return vn
      }
      return 0
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
          if (g.player && game.phase === 'shot' && game.savedAt === null) {
            game.savedAt = game.t
            fire('save')
          }
          reflect(-nx, -ny, 0.45)
        }
      }
    }

    const collideBoards = () => {
      const lim = CR - PUCK_R
      const corners = [
        [CR, CR], [L - CR, CR], [L - CR, W - CR], [CR, W - CR],
      ]
      let hit = 0
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
            hit = reflect(nx, ny)
          }
          if (hit > 20) fire('board')
          return
        }
      }
      if (puck.x < PUCK_R) { puck.x = PUCK_R; hit = Math.max(hit, reflect(-1, 0)) }
      if (puck.x > L - PUCK_R) { puck.x = L - PUCK_R; hit = Math.max(hit, reflect(1, 0)) }
      if (puck.y < PUCK_R) { puck.y = PUCK_R; hit = Math.max(hit, reflect(0, -1)) }
      if (puck.y > W - PUCK_R) { puck.y = W - PUCK_R; hit = Math.max(hit, reflect(0, 1)) }
      if (hit > 20) fire('board')
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
        if (left === PLAYER_LEFT) fire('goal')
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
      if (reflect(nx, ny, 0.6) > 20) fire('post')
    }

    // Demo only: shoot at a random net, or pass to a random spot on the ice
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

    const step = (dt: number) => {
      if (goal) {
        goal.t += dt
        puck.vx *= Math.exp(-6 * dt)
        puck.vy *= Math.exp(-6 * dt)
        puck.x += puck.vx * dt
        puck.y += puck.vy * dt
        if (game.phase === 'off' && goal.t > 2.2) {
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
        if (speed > 1 && !reduceMotion) {
          applyRinkTransform(tctx, lay)
          tctx.strokeStyle = `rgba(225, 242, 255, ${Math.min(0.35, speed / 260)})`
          tctx.lineWidth = 0.45
          tctx.lineCap = 'round'
          tctx.beginPath()
          tctx.moveTo(prevX, prevY)
          tctx.lineTo(puck.x, puck.y)
          tctx.stroke()
        }

        if (game.phase === 'off' && speed < 14) {
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

      // Fade old trail marks. Fading in larger steps a few times a second avoids the
      // 8-bit rounding that leaves faint lines behind when each frame removes very little.
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

      // Shot preview for the player: pass line, then the shot line to the target on the goal line
      if (game.phase === 'windup') {
        const progress = game.t / game.windup
        if (game.passTo) drawAim(ctx, puck, game.passTo, progress, '190, 230, 255')
        else drawAim(ctx, puck, game.target, progress)
      } else if (game.phase === 'pass' && game.passTo) {
        drawAim(ctx, game.passTo, game.target, 1)
      }

      for (const g of goalies) drawGoalie(ctx, g)

      for (const s of sparks) {
        ctx.fillStyle = `rgba(240, 250, 255, ${Math.min(1, s.life * 2.2)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 0.22, 0, Math.PI * 2)
        ctx.fill()
      }

      if (game.phase === 'windup') drawWindupRing(ctx, puck, time, reduceMotion)
      drawPuck(ctx, puck, time)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      lay = computeLayout(rect.width, rect.height, dpr, propsRef.current.insets)
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
    resizeRef.current = resize
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduceMotion) {
      // No demo animation; the puck rests on a faceoff dot until the player starts a round
      puck.x = GOAL_X + 20
      puck.y = CY - 22
    }

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      const { playing, round = 0 } = propsRef.current
      if (playing && (game.phase === 'off' || round !== game.round)) {
        game.round = round
        startRound()
      } else if (!playing && game.phase !== 'off') {
        stopRound()
      }

      if (!(active() && paused()) && (active() || !reduceMotion)) {
        if (active()) stepGame(dt)
        step(dt)
      }
      render(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      resizeRef.current = () => {}
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  // Re-fit the rink when the reserved space changes
  const top = props.insets?.top
  const bottom = props.insets?.bottom
  useEffect(() => {
    resizeRef.current()
  }, [top, bottom])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
