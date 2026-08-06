import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="top-nav">
      <NavLink to="/" end className="nav-link">基础</NavLink>
      <NavLink to="/chaiyao" className="nav-link">柴窑</NavLink>
    </nav>
  )
}
