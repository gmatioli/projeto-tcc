import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './header-style.css';

export function Header() {
  const navigate = useNavigate(); 
  
  // 1. Criamos o "interruptor" do menu (começa fechado/false)
  const [menuAberto, setMenuAberto] = useState(false);

  // 2. Função de Logout (Sair)
  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado'); 
    navigate('/'); 
  };

   const [dadosUsuario, setDadosUsuario] = useState({
      nome: '...', 
      nivelAcesso: '...'
    });
  
    useEffect(() => {      
      const carregarPerfil = async () => {
        const logado = localStorage.getItem('usuarioLogado');
        
        if (logado) {
          const { email } = JSON.parse(logado);
          
          try {
            const resposta = await fetch(`http://localhost:3001/perfil/${email}`);
            const dados = await resposta.json();
  
            if (dados.sucesso) {
              setDadosUsuario({
                nome: dados.usuario.nomeUsuario,            
                nivelAcesso: dados.usuario.nivelAcesso === 'admin' ? 'Administrador' : 'Docente'
              });
            } else {
               setDadosUsuario(prev => ({ ...prev, nome: "Usuário não encontrado" }));
            }
          } catch (erro) {
            console.error("Erro de conexão:", erro);
            setDadosUsuario(prev => ({ ...prev, nome: "Erro no servidor" }));
          }
        } 
      };
  
      carregarPerfil();
    }, [navigate]);

  return (
      <header className='header'>
        <div className="header_logo">
          <img src="/img/logo-senai.png" alt="Logo da instituição SENAI" />
        </div>
        <div className="header_profile">
          <div className="header_profile_name">
            <h3>{dadosUsuario.nome}</h3>
            <p>{dadosUsuario.nivelAcesso}</p>
          </div>
          
          <div className="header_profile_img" style={{ position: 'relative' }}>
            
            <img 
              src="/img/profile-icon.png" 
              onClick={() => setMenuAberto(!menuAberto)} 
              alt="Icone do perfil" 
              style={{ cursor: 'pointer' }}
            />

            {/* 4. O MENU DROPDOWN (Só aparece se menuAberto for true) */}
            {menuAberto && (
              <div className="dropdown-menu">
                
                {/* Botão Configurações de Perfil */}
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    navigate('/perfil'); 
                    setMenuAberto(false); 
                  }}
                >
                  {/* Ícone de Usuário */}
                <img src="./img/user.png" alt="" style={{ width: '22px', height: '22px', borderRadius: '0', objectFit: 'contain' }}/>
                  Config. Perfil
                </button>

                {/* Linha divisória */}
                <hr className="dropdown-divisor" />

                {/* Botão Sair */}
                <button 
                  className="dropdown-item" 
                  onClick={handleLogout}
                >
                  <img src="./img/sair.png" alt="" style={{ width: '22px', height: '22px', borderRadius: '0', objectFit: 'contain' }}/>

                  Sair
                </button>

              </div>
            )}

          </div>
        </div>
      </header>
  )
}