import type { Team } from '../bracket'
import { AVATAR } from '../layout'

type Props = { team: Team; size?: number }

/** รูปทีม — ถ้าไม่มีรูปจะแสดงกรอบว่าง */
export default function TeamAvatar({ team, size = AVATAR }: Props) {
  const box = { width: size, height: size }

  if (team.logo) {
    return (
      <img
        src={team.logo}
        alt=""
        style={box}
        className="shrink-0 rounded-lg bg-slate-800 object-cover ring-1 ring-slate-700"
      />
    )
  }

  return (
    <span
      style={box}
      className="shrink-0 rounded-lg bg-slate-800 ring-1 ring-slate-700"
      aria-hidden
    />
  )
}
