export type Team = {
  id: string
  /** ใช้เป็น alt/tooltip เท่านั้น ไม่แสดงบนผัง */
  name: string
  /** รูปทีม (URL จากโฟลเดอร์ image หรือ data URL ที่ผู้ใช้เลือกเอง) */
  logo?: string
}

export type Side = 'L' | 'R'
export type Slot = Team | null

/** matchId -> id ของทีมที่ถูกเลือกให้ชนะ */
export type Picks = Record<string, string>

/** สายการแข่ง: จำนวนทีมต้องเป็นเลขยกกำลังสอง จึงไม่มีทีมบาย */
export type Draw = { entrants: Team[]; size: number }

export const FINAL_ID = 'F'

export const matchId = (side: Side, round: number, index: number) =>
  `${side}-${round}-${index}`

export const makeDraw = (entrants: Team[]): Draw => ({
  entrants,
  size: entrants.length,
})

/** จำนวนรอบของแต่ละฝั่ง (ไม่รวมนัดชิงตรงกลาง) */
export const sideRounds = (size: number) => Math.log2(size) - 1

/** จำนวนคู่ในรอบ r ของแต่ละฝั่ง */
export const matchesInRound = (size: number, round: number) =>
  size / 4 / 2 ** round

/** ทีมตั้งต้นของคู่ในรอบแรก: ครึ่งแรกอยู่ฝั่งซ้าย ครึ่งหลังอยู่ฝั่งขวา */
const seedSlots = (size: number, side: Side, index: number): [number, number] => {
  const offset = side === 'L' ? 0 : size / 2
  return [offset + index * 2, offset + index * 2 + 1]
}

function readPick({ entrants }: Draw, picks: Picks, id: string): Slot {
  const teamId = picks[id]
  return entrants.find((t) => t.id === teamId) ?? null
}

export const winnerOf = (
  draw: Draw,
  picks: Picks,
  side: Side,
  round: number,
  index: number,
): Slot => readPick(draw, picks, matchId(side, round, index))

/** คู่แข่งสองฝ่ายของแต่ละแมตช์ (null = ยังไม่รู้ผลรอบก่อน) */
export function participants(
  draw: Draw,
  picks: Picks,
  side: Side,
  round: number,
  index: number,
): [Slot, Slot] {
  if (round === 0) {
    const [a, b] = seedSlots(draw.size, side, index)
    return [draw.entrants[a] ?? null, draw.entrants[b] ?? null]
  }
  return [
    winnerOf(draw, picks, side, round - 1, index * 2),
    winnerOf(draw, picks, side, round - 1, index * 2 + 1),
  ]
}

export function finalParticipants(draw: Draw, picks: Picks): [Slot, Slot] {
  const last = sideRounds(draw.size) - 1
  return [winnerOf(draw, picks, 'L', last, 0), winnerOf(draw, picks, 'R', last, 0)]
}

export const champion = (draw: Draw, picks: Picks): Slot =>
  readPick(draw, picks, FINAL_ID)

/** รอบนี้เลือกผู้ชนะครบทุกคู่ทั้งสองฝั่งแล้วหรือยัง */
export function roundComplete(draw: Draw, picks: Picks, round: number) {
  for (const side of ['L', 'R'] as Side[]) {
    for (let i = 0; i < matchesInRound(draw.size, round); i++) {
      if (!picks[matchId(side, round, i)]) return false
    }
  }
  return true
}

/** เปิดให้เลือกรอบนี้ได้ไหม — ต้องเลือกรอบก่อนหน้าให้ครบก่อน */
export const roundOpen = (draw: Draw, picks: Picks, round: number) =>
  round === 0 || roundComplete(draw, picks, round - 1)

/** รอบที่กำลังเลือกอยู่ + จำนวนคู่ที่ยังไม่เลือก (null = จบแล้ว) */
export function currentStage(draw: Draw, picks: Picks) {
  const rounds = sideRounds(draw.size)

  for (let r = 0; r < rounds; r++) {
    let remaining = 0
    for (const side of ['L', 'R'] as Side[]) {
      for (let i = 0; i < matchesInRound(draw.size, r); i++) {
        if (!picks[matchId(side, r, i)]) remaining++
      }
    }
    if (remaining > 0) return { round: r, remaining }
  }

  return picks[FINAL_ID] ? null : { round: rounds, remaining: 1 }
}

/** นัดชิงเปิดเมื่อรอบสุดท้ายของทั้งสองฝั่งเลือกครบ */
export const finalOpen = (draw: Draw, picks: Picks) =>
  roundComplete(draw, picks, sideRounds(draw.size) - 1)

/**
 * ลบผลที่ค้างอยู่ในรอบถัดไป เมื่อทีมที่เคยเลือกไม่ได้เข้ามาในคู่นั้นแล้ว
 * ไล่จากรอบต้นไปรอบท้าย เพื่อให้ผลกระทบไหลต่อกันเป็นทอดๆ
 */
export function prune(draw: Draw, picks: Picks): Picks {
  const next: Picks = { ...picks }

  for (let r = 0; r < sideRounds(draw.size); r++) {
    for (const side of ['L', 'R'] as Side[]) {
      for (let i = 0; i < matchesInRound(draw.size, r); i++) {
        const id = matchId(side, r, i)
        if (!next[id]) continue
        const pair = participants(draw, next, side, r, i)
        if (!pair.some((t) => t?.id === next[id])) delete next[id]
      }
    }
  }

  if (next[FINAL_ID]) {
    const pair = finalParticipants(draw, next)
    if (!pair.some((t) => t?.id === next[FINAL_ID])) delete next[FINAL_ID]
  }

  return next
}

/** ชื่อรอบสำหรับหัวคอลัมน์ */
export function roundLabel(size: number, round: number) {
  const remaining = size / 2 ** round
  if (remaining === 2) return 'รอบชิงชนะเลิศ'
  if (remaining === 4) return 'รอบรองชนะเลิศ'
  if (remaining === 8) return 'รอบ 8 ทีม'
  return `รอบ ${remaining} ทีม`
}
