import { useState } from 'react'
import './App.css'
import './components/header/header.jsx'
import { Header } from './components/header/header.jsx'
import { Sidebar } from './components/sidebar/sidebar.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header/>
      <Sidebar/>
      
    </>
  )
}

export default App
