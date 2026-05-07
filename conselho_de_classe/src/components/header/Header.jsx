import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomepageDocente } from '../../pages/Docente/HomepageDocente.jsx';

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
      <header className='h-[8vh] bg-[var(--header_bg)] flex justify-between items-center'>
        <div className="ml-7">
          <img onClick={() => navigate('/docente/home')}  src="/img/logo-senai.png" alt="Logo da instituição SENAI" className='w-35 h-9 cursor-pointer' />
        </div>
        <div className="flex g-2 mr-7">
          <div className="flex flex-col justify-center ">
            <h3 className='font-[var(--font_inter)] text-xl'>{dadosUsuario.nome}</h3>
            <p className='font-[var(--font_inter)] text-xs text-end'>{dadosUsuario.nivelAcesso}</p>
          </div>
          
          <div className='ml-2 relative'>
            
            <img 
              src="/img/profile-icon.png" 
              onClick={() => setMenuAberto(!menuAberto)} 
              alt="Icone do perfil" 
              className='w-10 h-10 rounded-full cursor-pointer'
            />

            {/* 4. O MENU DROPDOWN (Só aparece se menuAberto for true) */}
            {menuAberto && (
              <div className="absolute top-[110%] right-0 bg-[#f0f0f0] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-[200px] py-2.5 z-[1000] flex flex-col">
                
                {/* Botão Configurações de Perfil */}
                <button 
                  className="flex items-center g-[15px] py-3 px-5 bg-transparent border-none w-full text-left text-base text-[#111] cursor-pointer transition-colors duration-200" 
                  onClick={() => {
                    navigate('/perfil'); 
                    setMenuAberto(false); 
                  }}
                >
                  {/* Ícone de Usuário */}
                <img src="./img/user.png" alt="" className="w-[22px] h-[22px] object-contain mr-2"/>
                  Config. Perfil
                </button>

                {/* Linha divisória */}
                <hr className="mx-5 border-none hover:bg-[rgb(201,198,198)]" />

                {/* Botão Sair */}
                <button 
                  className="flex items-center g-[15px] py-3 px-5 bg-transparent border-none w-full text-left text-base text-[#111] cursor-pointer transition-colors duration-200 border-t border-neutral-800" 
                  onClick={handleLogout}
                >
                  <img src="./img/sair.png" alt="" className="w-[22px] h-[22px] object-contain mr-2"/>

                  Sair
                </button>

              </div>
            )}

          </div>
        </div>
      </header>
  )
}
