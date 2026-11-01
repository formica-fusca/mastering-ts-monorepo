import { Link, Outlet, ScrollRestoration } from 'react-router'
import { site } from '../content'

export function Layout() {
  return (
    <>
      <header className="masthead">
        <Link to="/" className="masthead-title">{site.siteTitle}</Link>
        <nav className="masthead-nav">
          <Link to="/">Program</Link>
          <a href={site.repo.url} target="_blank" rel="noreferrer">Repository</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}
