/** ค่าคงที่ของเลย์เอาต์ — ใช้คำนวณระยะห่างให้เส้นเชื่อมตรงกับกลางการ์ดพอดี */
export const AVATAR = 88 // ขนาดรูปทีมบนผัง
export const SLOT_H = AVATAR + 6
export const SLOT_GAP = 4
export const CARD_PAD = 4
export const MATCH_H = SLOT_H * 2 + SLOT_GAP + CARD_PAD * 2
export const BASE_GAP = 14 // ระยะห่างระหว่างคู่ในรอบแรก
export const CARD_W = AVATAR + 20
export const STUB = 16 // ความยาวเส้นแนวนอนแต่ละข้าง (ครึ่งของช่องว่างระหว่างคอลัมน์)

/** นัดชิงตรงกลาง — ใหญ่กว่าคู่ทั่วไปเพื่อให้เด่น */
export const FINAL_AVATAR = 144
export const FINAL_SLOT_H = FINAL_AVATAR + 8
export const FINAL_PAD = 8
export const FINAL_MATCH_H = FINAL_SLOT_H * 2 + SLOT_GAP + FINAL_PAD * 2
export const FINAL_CARD_W = FINAL_AVATAR + 26

export const PITCH = MATCH_H + BASE_GAP

/** ช่องว่างระหว่างคู่ในรอบ r ที่ทำให้กลางการ์ดตรงกับกลางของคู่ในรอบก่อน */
export const gapForRound = (round: number) => PITCH * 2 ** round - MATCH_H

/** ระยะครึ่งทางระหว่างจุดกลางของสองคู่ที่จะมาเจอกัน */
export const connectorH = (round: number) => (PITCH * 2 ** round) / 2

/** ขนาดจริงของผังก่อนย่อ/ขยาย — ใช้คำนวณสเกลให้พอดีจอ */
export const bracketWidth = (size: number) => {
  const rounds = Math.log2(size) - 1
  const columns = 2 * rounds * CARD_W + FINAL_CARD_W
  const gaps = 2 * rounds * (STUB * 2)
  return columns + gaps
}

export const bracketHeight = (size: number) =>
  Math.max((size / 4) * PITCH - BASE_GAP, FINAL_MATCH_H)
