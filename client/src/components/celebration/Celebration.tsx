import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trophy } from 'lucide-react'
import { Achievement } from '@/types/models'
import Button from '@/components/ui/Button'
import GradeBadge from '@/components/routes/GradeBadge'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { frenchToUIAA } from '@/utils/grades'

const listeners = new Set<(a: Achievement) => void>()

/** Show the personal-best celebration (no-op for null). */
export function celebrate(achievement: Achievement | null | undefined) {
  if (!achievement) return
  listeners.forEach((l) => l(achievement))
}

const COLORS = ['#3182CE', '#38A169', '#DD6B20', '#E53E3E', '#EAB308', '#8B5CF6']

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const pieces = Array.from({ length: 140 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let frame = 0
    let raf = 0
    const tick = () => {
      frame++
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of pieces) {
        p.vy += 0.35
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, 1 - frame / 160)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }
      if (frame < 160) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

/** Mount once in the app layout. */
export function CelebrationHost() {
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const { getGradeBadgeSystem, getEffectiveSystem } = useGradingSystem()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const listener = (a: Achievement) => setAchievement(a)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!achievement) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAchievement(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [achievement])

  if (!achievement) return null

  const display = (g: string) => (getEffectiveSystem(null) === 'UIAA' ? frenchToUIAA(g) : g)

  return createPortal(
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-rock-900/40 animate-fade-in" onClick={() => setAchievement(null)} aria-hidden="true" />
      <Confetti />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center animate-sheet-up"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
          <Trophy className="w-9 h-9 text-yellow-500" aria-hidden="true" />
        </div>
        <h2 id="celebration-title" className="text-xl font-bold text-rock-900">
          {achievement.previousGrade ? 'New personal best!' : 'First send logged!'}
        </h2>
        <div className="my-4 flex justify-center">
          <GradeBadge grade={achievement.grade} size="lg" system={getGradeBadgeSystem(null)} />
        </div>
        <p className="text-sm text-rock-600">
          {achievement.previousGrade
            ? `Your hardest send is now ${display(achievement.grade)}, up from ${display(achievement.previousGrade)}.`
            : `Your hardest send so far is ${display(achievement.grade)}. The only way is up.`}
        </p>
        <Button ref={closeRef} className="mt-6 w-full" onClick={() => setAchievement(null)}>
          Let's go!
        </Button>
      </div>
    </div>,
    document.body
  )
}
