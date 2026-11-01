import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="shell"><div className="reading">
      <p className="path">ERR_MODULE_NOT_FOUND</p>
      <h1>Nothing resolves at this address</h1>
      <p>The walk went all the way up and found no file. <Link to="/">Back to the program.</Link></p>
    </div></div>
  )
}
