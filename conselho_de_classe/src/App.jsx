import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header className='header'>
        <div className="header_logo">
          <img src="/img/logo-senai.png" alt="Logo da instituição SENAI" />
        </div>
        <div className="header_profile">
          <div className="header_profile_name">
            <h3>Admin</h3>
            <p>Administrador</p>
          </div>
          <div className="header_profile_image">
            <img src="/img/profile-icon.png" alt="Icone do perfil" />
          </div>
        </div>
      </header>
      
    </>
  )
}

export default App
