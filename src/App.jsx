import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Chaiyao from './pages/Chaiyao'

export default function App() {
  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chaiyao" element={<Chaiyao />} />
      </Routes>
    </div>
  )
}
