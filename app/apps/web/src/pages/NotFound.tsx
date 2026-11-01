import { Link } from 'react-router'

export function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>Nothing is mapped at this address. <Link to="/">Back to the program.</Link></p>
    </>
  )
}
