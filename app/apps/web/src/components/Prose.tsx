import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

/**
 * Renders pre-built HTML from the content pipeline. Internal links are intercepted so
 * navigation stays client-side; external ones open normally.
 */
export function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return
      const href = a.getAttribute('href') ?? ''
      if (href.startsWith('/')) { e.preventDefault(); navigate(href) }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [navigate])
  return <div ref={ref} className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
