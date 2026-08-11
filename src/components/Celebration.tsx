import { useEffect, useMemo } from 'react'
import type { Team } from '../bracket'
import TeamAvatar from './TeamAvatar'

const COLORS = ['#f472b6', '#a855f7', '#22d3ee', '#facc15', '#34d399', '#fb7185']

type Props = { team: Team; onClose: () => void }

/** หน้าฉลองแชมป์ — คอนเฟตตี + วงแสงหมุน + ตัวหนังสือนีออน */
export default function Celebration({ team, onClose }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        key: i,
        left: `${Math.random() * 100}%`,
        width: 6 + Math.random() * 7,
        height: 10 + Math.random() * 14,
        color: COLORS[i % COLORS.length],
        delay: `${Math.random() * 2.5}s`,
        duration: `${2.6 + Math.random() * 2.4}s`,
      })),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-label="ผู้ชนะ"
      onClick={onClose}
      className="champ-backdrop fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden bg-slate-950/85 px-4 backdrop-blur-sm sm:gap-7"
    >
      {/* ลำแสงหมุนด้านหลัง */}
      <div className="champ-beam pointer-events-none absolute h-[160vmax] w-[160vmax] rounded-full opacity-20" />

      {/* คอนเฟตตี */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.key}
            className="confetti-piece"
            style={{
              left: c.left,
              width: c.width,
              height: c.height,
              background: c.color,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>

      <p className="neon-title relative text-2xl sm:text-4xl lg:text-5xl">CHAMPION</p>

      <div className="champ-pop relative">
        <div className="champ-ring absolute -inset-4 rounded-[2rem] blur-lg" />
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="relative aspect-square w-[min(68vw,46vh,18rem)] rounded-3xl object-cover shadow-[0_0_60px_rgba(244,114,182,0.7)] ring-4 ring-white/80"
          />
        ) : (
          <div className="relative">
            <TeamAvatar team={team} size={224} />
          </div>
        )}
      </div>
    </div>
  )
}
