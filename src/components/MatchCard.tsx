import type { Slot } from '../bracket'
import {
  AVATAR,
  CARD_PAD,
  CARD_W,
  FINAL_AVATAR,
  FINAL_CARD_W,
  FINAL_MATCH_H,
  FINAL_PAD,
  FINAL_SLOT_H,
  MATCH_H,
  SLOT_GAP,
  SLOT_H,
} from '../layout'
import TeamAvatar from './TeamAvatar'

type Props = {
  pair: [Slot, Slot]
  pickedId?: string
  /** ยังเลือกไม่ได้ เพราะรอบก่อนหน้ายังไม่ครบ */
  locked?: boolean
  /** 'final' = การ์ดนัดชิงตรงกลาง รูปใหญ่กว่าและมีไฟนีออน */
  variant?: 'default' | 'final'
  onPick: (teamId: string) => void
}

const METRICS = {
  default: { avatar: AVATAR, slotH: SLOT_H, cardW: CARD_W, cardH: MATCH_H, pad: CARD_PAD },
  final: {
    avatar: FINAL_AVATAR,
    slotH: FINAL_SLOT_H,
    cardW: FINAL_CARD_W,
    cardH: FINAL_MATCH_H,
    pad: FINAL_PAD,
  },
} as const

export default function MatchCard({
  pair,
  pickedId,
  locked = false,
  variant = 'default',
  onPick,
}: Props) {
  const m = METRICS[variant]
  const isFinal = variant === 'final'
  const ready = isFinal && pair.every(Boolean) // ถึงคู่ชิง 1-1 แล้ว → เปิดไฟนีออน

  return (
    <div
      className={[
        'relative flex flex-col items-center bg-slate-900/80',
        isFinal
          ? 'rounded-2xl border-2 ' +
            (ready && !locked
              ? 'final-neon'
              : 'border-slate-700 shadow-[0_0_16px_rgba(99,102,241,0.25)]')
          : 'rounded-xl ring-1 ring-slate-800',
        locked ? 'opacity-55' : '',
      ].join(' ')}
      style={{ height: m.cardH, width: m.cardW, gap: SLOT_GAP, padding: m.pad }}
    >
      {pair.map((team, i) => {
        const picked = !!team && team.id === pickedId
        const decided = !!pickedId
        const clickable = !!team && !locked

        return (
          <button
            key={i}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (team && !locked) onPick(team.id)
            }}
            title={
              locked
                ? 'เลือกรอบก่อนหน้าให้ครบทุกคู่ก่อน'
                : team
                  ? 'เลือกรูปนี้ให้ชนะ'
                  : 'รอผลรอบก่อนหน้า'
            }
            style={{ height: m.slotH }}
            className={[
              'relative flex w-full items-center justify-center rounded-lg transition-all',
              clickable ? 'cursor-pointer' : 'cursor-not-allowed',
              picked
                ? isFinal
                  ? 'bg-fuchsia-500/20 shadow-[0_0_20px_rgba(244,114,182,0.65)] ring-2 ring-fuchsia-300'
                  : 'bg-indigo-500/20 ring-2 ring-indigo-400'
                : '',
              decided && !picked ? 'opacity-30 grayscale' : '',
              clickable && !picked ? 'hover:bg-slate-800' : '',
            ].join(' ')}
          >
            {team ? (
              <>
                <TeamAvatar team={team} size={m.avatar} />
                {picked && (
                  <span
                    className={[
                      'absolute right-1 bottom-1 flex items-center justify-center rounded-full font-bold text-white',
                      isFinal
                        ? 'h-6 w-6 bg-fuchsia-500 text-sm shadow-[0_0_12px_rgba(244,114,182,0.9)]'
                        : 'h-4 w-4 bg-indigo-500 text-[10px]',
                    ].join(' ')}
                  >
                    ✓
                  </span>
                )}
              </>
            ) : (
              <span className={isFinal ? 'text-3xl text-slate-700' : 'text-lg text-slate-700'}>
                —
              </span>
            )}
          </button>
        )
      })}

      {locked && pair.some(Boolean) && (
        <span
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] ring-1 ring-slate-600"
          title="เลือกรอบก่อนหน้าให้ครบทุกคู่ก่อน"
        >
          🔒
        </span>
      )}
    </div>
  )
}
