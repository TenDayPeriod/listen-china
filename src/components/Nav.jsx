import { NavLink } from 'react-router-dom'

export default function Nav({ theme = '' }) {
  return (
    <nav className={`page-nav ${theme}`}>
      <div className="page-nav-inner">
        <NavLink to="/" end className="nav-link">听风轩</NavLink>
        <span className="nav-divider">·</span>
        <NavLink to="/chaiyao" className="nav-link">柴窑</NavLink>
        <span className="nav-divider">·</span>
        <NavLink to="/teaside" className="nav-link">茶周边</NavLink>
      </div>
    </nav>
  )
}
