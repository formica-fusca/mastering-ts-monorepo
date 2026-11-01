import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { ModulePage } from './pages/ModulePage'
import { ExercisesIndexPage } from './pages/ExercisesIndexPage'
import { LessonPageView } from './pages/LessonPageView'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { NotFound } from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'modules/:number', element: <ModulePage /> },
      { path: 'modules/:number/exercises', element: <ExercisesIndexPage /> },
      { path: 'lessons/:slug', element: <LessonPageView /> },
      { path: 'demos/:slug', element: <PlaygroundPage kind="demo" /> },
      { path: 'exercises/:slug', element: <PlaygroundPage kind="exercise" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') })
