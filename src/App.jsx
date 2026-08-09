import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chaiyao from './pages/Chaiyao'
import TeaSides from './pages/TeaSides'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chaiyao" element={<Chaiyao />} />
        <Route path="/teaside" element={<TeaSides />} />
      </Routes>
    </div>
  )
}
