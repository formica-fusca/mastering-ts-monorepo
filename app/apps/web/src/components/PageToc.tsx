import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { EdgePanel } from './EdgePanel'

interface Heading { id: string; text: string; level: 2 | 3; index: number }

/**
 * The current page's own table of contents on the right edge: one step per section
 * (h2), numbered in reading order, with the section in view marked. The card lists
 * every h2 and h3 of the rendered content.
 */
export function PageToc({ title }: { title: string }) {
  const { pathname } = useLocation()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLHeadingElement>('.reading .prose h2[id], .reading .prose h3[id]'))
      .filter((h) => !/^table of contents$/i.test(h.textContent?.trim() ?? ''))
    let n = 0
    const list: Heading[] = els.map((h) => ({
      id: h.id, text: h.textContent?.trim() ?? '', level: h.tagName === 'H2' ? 2 : 3,
      index: h.tagName === 'H2' ? ++n : n,
    }))
    setHeadings(list)
    const onScroll = () => {
      const top = 140
      let current: string | null = null
      for (const h of els) { if (h.getBoundingClientRect().top <= top) current = h.id; else break }
      setActive(current ?? els[0]?.id ?? null)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const sections = headings.filter((h) => h.level === 2)
  if (sections.length === 0) return null
  const activeSection = headings.find((h) => h.id === active)?.index ?? null

  return (
    <EdgePanel
      side="right"
      label="On this page"
      strip={
        <ol className="edge-list">
          {sections.map((h) => (
            <li key={h.id} className={activeSection === h.index ? 'current' : ''}>
              <a href={`#${h.id}`} aria-current={activeSection === h.index ? 'location' : undefined} title={h.text}>{h.index}</a>
            </li>
          ))}
        </ol>
      }
      card={
        <>
          <p className="edge-card-title">{title}</p>
          <ol className="page-toc">
            {headings.map((h) => (
              <li key={h.id} className={`level-${h.level} ${active === h.id ? 'current' : ''}`}>
                <a href={`#${h.id}`}>{h.level === 2 && <span className="page-toc-num">{h.index}</span>}{h.text}</a>
              </li>
            ))}
          </ol>
        </>
      }
    />
  )
}
