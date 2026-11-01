import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { site } from '../content'

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <Link to="/" className="brand">{site.siteTitle}</Link>
          <nav className="nav">
            <NavLink to="/">Program</NavLink>
            <a href={site.repo.url} target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="site-footer container">
        <p>
          A one-student masterclass, taught by an AI instructor and archived in the open.
          Content generated from <a href={site.repo.url} target="_blank" rel="noreferrer">the repository</a> on{' '}
          {new Date(site.generatedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}.
        </p>
      </footer>
      <ScrollRestoration />
    </>
  )
}
