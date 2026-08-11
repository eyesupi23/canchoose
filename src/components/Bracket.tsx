import {
  FINAL_ID,
  finalOpen,
  finalParticipants,
  matchId,
  matchesInRound,
  participants,
  roundOpen,
  sideRounds,
  type Draw,
  type Picks,
  type Side,
} from '../bracket'
import {
  CARD_W,
  FINAL_CARD_W,
  FINAL_MATCH_H,
  MATCH_H,
  STUB,
  bracketHeight,
  bracketWidth,
  connectorH,
  gapForRound,
} from '../layout'
import MatchCard from './MatchCard'

type Props = {
  draw: Draw
  picks: Picks
  onPick: (id: string, teamId: string) => void
}

const LINE = 'absolute rounded-full'
/** เส้นปกติ / เส้นที่รู้ผลแล้ว (สว่างขึ้นและมีแสงเรือง) */
const LINE_IDLE = 'bg-slate-500/80'
const LINE_LIVE = 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.9)]'
const THICK = 2

export default function Bracket({ draw, picks, onPick }: Props) {
  const { size } = draw
  const rounds = sideRounds(size)
  const [finalA, finalB] = finalParticipants(draw, picks)
  const finalReady = !!finalA && !!finalB
  const finalLocked = !finalOpen(draw, picks)

  const column = (side: Side, round: number) => {
    const count = matchesInRound(size, round)
    // ต้องเลือกรอบก่อนหน้าให้ครบทุกคู่ก่อน จึงจะเลือกรอบนี้ได้
    const locked = !roundOpen(draw, picks, round)
    const inSide = side === 'L' ? 'left' : 'right'
    const outSide = side === 'L' ? 'right' : 'left'

    return (
      <div
        key={`${side}${round}`}
        className="flex flex-col justify-center"
        style={{ gap: gapForRound(round), width: CARD_W }}
      >
        {Array.from({ length: count }, (_, i) => {
          const id = matchId(side, round, i)
          const pair = participants(draw, picks, side, round, i)
          const half = i % 2 === 0 ? 'down' : 'up'
          const out = picks[id] ? LINE_LIVE : LINE_IDLE
          const into = pair.some(Boolean) ? LINE_LIVE : LINE_IDLE
          return (
            <div key={id} className="relative" style={{ height: MATCH_H, width: CARD_W }}>
              <MatchCard
                pair={pair}
                pickedId={picks[id]}
                locked={locked}
                onPick={(teamId) => onPick(id, teamId)}
              />

              {/* เส้นเข้าจากรอบก่อนหน้า */}
              {round > 0 && (
                <span
                  className={`${LINE} ${into}`}
                  style={{ [inSide]: -STUB, top: '50%', width: STUB, height: THICK }}
                />
              )}

              {/* เส้นออกไปหารอบถัดไป + เส้นตั้งที่รวมสองคู่เข้าด้วยกัน */}
              <span
                className={`${LINE} ${out}`}
                style={{ [outSide]: -STUB, top: '50%', width: STUB, height: THICK }}
              />
              {count > 1 && (
                <span
                  className={`${LINE} ${out}`}
                  style={{
                    [outSide]: -STUB,
                    width: THICK,
                    height: connectorH(round),
                    ...(half === 'down' ? { top: '50%' } : { bottom: '50%' }),
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{ width: bracketWidth(size), height: bracketHeight(size) }}
      className="flex items-center justify-center"
    >
      <div className="flex items-center justify-center" style={{ gap: STUB * 2 }}>
        {Array.from({ length: rounds }, (_, r) => column('L', r))}

        {/* นัดชิงชนะเลิศ ตรงกลาง */}
        <div
          className="relative flex flex-col justify-center"
          style={{ width: FINAL_CARD_W, height: FINAL_MATCH_H }}
        >
          {/* วงแสงหมุนอยู่หลังการ์ด เปิดเมื่อคู่ชิงครบสองฝ่าย */}
          {finalReady && !finalLocked && (
            <div className="final-halo pointer-events-none absolute -inset-6 rounded-[2rem]" />
          )}

          <div className="relative" style={{ height: FINAL_MATCH_H, width: FINAL_CARD_W }}>
            <MatchCard
              pair={[finalA, finalB]}
              pickedId={picks[FINAL_ID]}
              locked={finalLocked}
              variant="final"
              onPick={(teamId) => onPick(FINAL_ID, teamId)}
            />
            <span
              className={`${LINE} ${finalA ? LINE_LIVE : LINE_IDLE}`}
              style={{ left: -STUB, top: '50%', width: STUB, height: THICK }}
            />
            <span
              className={`${LINE} ${finalB ? LINE_LIVE : LINE_IDLE}`}
              style={{ right: -STUB, top: '50%', width: STUB, height: THICK }}
            />
          </div>
        </div>

        {Array.from({ length: rounds }, (_, r) => column('R', rounds - 1 - r))}
      </div>
    </div>
  )
}
