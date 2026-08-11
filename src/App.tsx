import { useEffect, useMemo, useRef, useState } from 'react'
import Bracket from './components/Bracket'
import Celebration from './components/Celebration'
import { champion, makeDraw, prune, type Picks } from './bracket'
import { bracketHeight, bracketWidth } from './layout'
import { teamsForDraw } from './teams'
import { useFitScale } from './useFitScale'

export default function App() {
  const [teams] = useState(() => teamsForDraw())
  const [picks, setPicks] = useState<Picks>({})
  /** id ของแชมป์ที่ปิดหน้าฉลองไปแล้ว — เลือกแชมป์คนใหม่แล้วฉลองอีกครั้ง */
  const [celebrated, setCelebrated] = useState<string | null>(null)

  const draw = useMemo(() => makeDraw(teams), [teams])
  const winner = champion(draw, picks)

  const naturalW = bracketWidth(draw.size)
  const naturalH = bracketHeight(draw.size)
  // ขยายเมื่อจอใหญ่ แต่ไม่ย่อเมื่อจอเล็ก — มือถือ/แท็บเล็ตให้เลื่อนดูแทน
  const { ref: measureRef, scale } = useFitScale(naturalW, naturalH, { bottomGap: 32 })

  const scrollRef = useRef<HTMLElement>(null)
  const contentW = naturalW * scale
  const contentH = naturalH * scale

  // เริ่มต้นให้นัดชิงตรงกลางอยู่กลางจอ แล้วเลื่อนออกไปดูรอบนอกได้
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
  }, [contentW, contentH])

  const pick = (id: string, teamId: string) => {
    setPicks((prev) => {
      const next = { ...prev }
      // คลิกซ้ำที่รูปเดิม = ยกเลิกผลของคู่นั้น
      if (next[id] === teamId) delete next[id]
      else next[id] = teamId
      return prune(draw, next)
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 py-5 sm:py-8">
      <h1 className="neon-title px-4 text-center text-2xl uppercase sm:text-4xl lg:text-5xl">
        Choose your love
      </h1>

      <p className="mt-1 text-center text-[11px] tracking-widest text-slate-600 lg:hidden">
        ← เลื่อนดูผังได้ทุกทิศ →
      </p>

      <main
        ref={scrollRef}
        className="mt-4 max-h-[calc(100dvh-9rem)] overflow-auto overscroll-contain px-3 pb-4 sm:mt-6 sm:px-6"
      >
        {/* div นี้กว้างเท่าพื้นที่ที่ใช้ได้จริง (ไม่รวม padding) จึงใช้วัดขนาดได้ */}
        <div ref={measureRef} className="w-full">
          <div className="mx-auto" style={{ width: contentW, height: contentH }}>
            <div
              style={{
                width: naturalW,
                height: naturalH,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <Bracket draw={draw} picks={picks} onPick={pick} />
            </div>
          </div>
        </div>
      </main>

      {winner && celebrated !== winner.id && (
        <Celebration team={winner} onClose={() => setCelebrated(winner.id)} />
      )}
    </div>
  )
}
