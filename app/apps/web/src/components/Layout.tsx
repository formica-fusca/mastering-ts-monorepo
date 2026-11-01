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
      <footer className="colophon">
        <p>
          Notes from a one-student masterclass, taught by an AI instructor and kept in the open. Built from
          the repository on {new Date(site.generatedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}.
          Set in Source Serif and JetBrains Mono.
        </p>
      </footer>
      <ScrollRestoration />
    </>
  )
}
