import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A fixed strip on the left or right edge of the viewport holding a compact list
 * (numbers), with a card that opens over the page on hover, focus, or when pinned.
 * Without a strip, the panel is just a larger toggle.
 */
export function EdgePanel({ side, label, strip, card }: { side: 'left' | 'right'; label: string; strip?: ReactNode; card: ReactNode }) {
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const enter = () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setHovering(true) }
  const leave = () => { closeTimer.current = window.setTimeout(() => setHovering(false), 350) }
  useEffect(() => {
    if (!pinned) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setPinned(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPinned(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [pinned])
  const open = hovering || pinned
  return (
    <nav ref={rootRef} className={`edge edge-${side} ${strip ? '' : 'edge-bare'} ${open ? 'open' : ''}`} aria-label={label} onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className="edge-toggle"
        aria-expanded={pinned}
        aria-label={pinned ? `Close: ${label}` : `Pin open: ${label}`}
        onClick={() => setPinned((v) => !v)}
      >
        {pinned ? '×' : '≡'}
      </button>
      {strip}
      <div className="edge-card">{card}</div>
    </nav>
  )
}
