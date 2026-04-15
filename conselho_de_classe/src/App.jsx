import { useState } from 'react'
import './App.css'
import './components/header/header.jsx'
import { Header } from './components/header/header.jsx'
import { Sidebar } from './components/sidebar/sidebar.jsx'
import { ConselhoIntermediario } from './components/conselho-intermediario/conselho-intermediario.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-wrapper">
    <Header /> {/* Fica no topo */}
    <div className="main-container">
      <Sidebar />
      <main className="content-area">
        <ConselhoIntermediario />
      </main>
    </div>
  </div>
  )
}

export default App
