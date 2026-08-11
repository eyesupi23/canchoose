import type { Team } from './bracket'

/** รูปทั้งหมดใน src/assets/image เรียงตามเลขในชื่อไฟล์ (1.jpg, 2.jpg, … ) */
const modules = import.meta.glob<string>('./assets/image/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})

const numberIn = (path: string) =>
  Number(path.match(/(\d+)\D*$/)?.[1] ?? Number.MAX_SAFE_INTEGER)

export type Picture = { no: number; src: string }

export const PICTURES: Picture[] = Object.keys(modules)
  .sort((a, b) => numberIn(a) - numberIn(b))
  .map((path) => ({ no: numberIn(path), src: modules[path] }))

/**
 * ขนาดสาย = เลขยกกำลังสองที่รองรับรูปทั้งหมดได้ (28 รูป → สาย 32 ช่อง)
 * ช่องที่เกินมาจะเติมด้วยรูปเดิมแบบสุ่ม จึงไม่มีทีมบาย
 */
export const DRAW_SIZE = 2 ** Math.ceil(Math.log2(Math.max(2, PICTURES.length)))

/** สลับลำดับแบบ Fisher–Yates */
function shuffle(list: Picture[]): Picture[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * สร้างทีมสำหรับสายขนาด size
 * - ช่อง 1..n ใช้รูปตามลำดับเลขไฟล์
 * - ช่องที่เหลือ (เช่น 29–32) สุ่มหยิบรูปเดิมมาใช้ซ้ำ ไม่ซ้ำกันเองในรอบนั้น และเปลี่ยนทุกครั้งที่เริ่มใหม่
 */
export function teamsForDraw(size = DRAW_SIZE): Team[] {
  const inOrder = PICTURES.slice(0, size)
  const fillers = shuffle(PICTURES).slice(0, Math.max(0, size - inOrder.length))

  return [...inOrder, ...fillers].map((pic, i) => ({
    id: `t${i}`,
    name: pic ? `รูป ${pic.no}` : `ทีม ${i + 1}`,
    logo: pic?.src,
  }))
}
