import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router'
import './styles.css'

// Palette preview: ?palette=verdigris|plum|oxide sticks for the session; ?palette=default clears it.
{
  const wanted = new URLSearchParams(location.search).get('palette')
  if (wanted) {
    try {
      if (wanted === 'default') sessionStorage.removeItem('palette')
      else sessionStorage.setItem('palette', wanted)
    } catch { /* private mode */ }
  }
  let chosen: string | null = null
  try { chosen = sessionStorage.getItem('palette') } catch { /* private mode */ }
  if (chosen) document.documentElement.dataset.palette = chosen
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
