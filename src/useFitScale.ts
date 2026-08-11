import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

type Options = {
  /** ย่อได้ต่ำสุดเท่าไร — ค่าเริ่มต้น 1 คือ "ไม่ย่อเลย" ให้เลื่อนจอดูแทน */
  min?: number
  /** ขยายได้สูงสุดเท่าไร เมื่อจอใหญ่กว่าผัง */
  max?: number
  /** เว้นที่ด้านล่างจอ */
  bottomGap?: number
}

/**
 * คำนวณอัตราขยายให้เนื้อหาขนาดคงที่ (naturalW × naturalH) ใช้พื้นที่จอให้คุ้ม
 * โดยค่าเริ่มต้นจะ "ขยายเท่านั้น ไม่ย่อ" — จอเล็ก (มือถือ/แท็บเล็ต) จึงได้รูปขนาดเต็ม
 * แล้วเลื่อนดูซ้าย-ขวาได้ ดีกว่าย่อจนมองไม่เห็น
 */
export function useFitScale(
  naturalW: number,
  naturalH: number,
  { min = 1, max = 1.6, bottomGap = 24 }: Options = {},
) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(min)
  const lastWidth = useRef(0)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const availW = el.clientWidth
    const availH = window.innerHeight - el.getBoundingClientRect().top - bottomGap
    if (availW <= 0) return
    setScale(clamp(Math.min(availW / naturalW, availH / naturalH), min, max))
  }, [naturalW, naturalH, min, max, bottomGap])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    measure()

    // สังเกตแค่ความกว้าง — ความสูงเปลี่ยนตามสเกลเอง จะวนไม่จบถ้าเอามาคิดด้วย
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      if (Math.abs(width - lastWidth.current) < 1) return
      lastWidth.current = width
      measure()
    })
    observer.observe(el)
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [measure])

  return { ref, scale }
}
