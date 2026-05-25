import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscAccount } from "react-icons/vsc";
import { VscGitStashPop } from "react-icons/vsc";
import { API, authFetch } from '../../config/api';


export function Perfil() {
  const navigate = useNavigate();

  // Começa com textos de "Carregando..." para o usuário saber que o sistema está pensando
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '...', 
    email: '...',
    nivelAcesso: '...'
  });

  useEffect(() => {
    document.title = "Perfil | Sistema de Conselhos";
    
    const carregarPerfil = async () => {
      const logado = localStorage.getItem('usuarioLogado');
      
      if (logado) {
        const { email } = JSON.parse(logado);
        
        try {
          const resposta = await authFetch(`${API.perfil}/${email}`);
          const dados = await resposta.json(); 

          if (dados.sucesso) {
            setDadosUsuario({
              nome: dados.usuario.nomeUsuario,             
              email: dados.usuario.emailInstitucional,     
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
    <div className="py-5 px-10 w-full box-border">
      <nav className='mb-20'>
        <span className="text-sm text-gray-500">
          {' / '}
          <span className="font-medium text-gray-700">Perfil</span>
        </span>
      </nav>

      <div className="flex p-10 max-w-[1100px] bg-gray-50 rounded-[16px] border-2 border-gray-500 shadow-[4px_4px_12px_gray]">
        
        {/* COLUNA DA ESQUERDA: FOTO */}
        <div className="flex flex-col items-center justify-center pr-12">
          <div className="flex items-center justify-center bg-gray-100 w-[150px] h-[150px] rounded-full mb-5 border-2 border-gray-600 ">
           <VscAccount size={140} color={"#747272ff"} />

          </div>
          
          {/* <button className="btn-carregar-foto">
            Carregar Foto  
            
            <VscGitStashPop size={20} />

          </button> */}

          <input className="flex items-center bg-gray-100 border-2 border-gray-600 rounded-[10px] py-4 px-8 cursor-pointer trasition-all duration-200 hover:bg-[#E5E5E5] hover:scale-95 " type="file"></input>
        </div>

        {/* COLUNA DA DIREITA: DADOS DO BANCO */}
        <div className="flex flex-col justify-center pl-12 border-l border-gray-700">
          <div className="mb-5 text-xl">
            <strong className="mr-2 font-bold">Nome:</strong> <span>{dadosUsuario.nome}</span>
          </div>
          
          <div className="mb-5 text-xl">
            <strong className="mr-2 font-bold">E-mail:</strong> <span>{dadosUsuario.email}</span>
          </div>
          
          <div className="mb-5 text-xl">
            <strong className="mr-2 font-bold">Nível de Acesso:</strong> <span>{dadosUsuario.nivelAcesso}</span>
          </div>
          
      

          <div className="flex gap-[15px] mt-[30px] ">
            <button className="py-3 px-10 rounded-[8px] text-xl cursor-pointer trasition-all duration-200 bg-[var(--red-senai)] border-2 border-red-800 text-white hover:scale-95 hover:opacity[0.8]" onClick={() => navigate('/dashboard')}>
              Fechar
            </button>
            <button className="py-3 px-10 rounded-[8px] text-xl cursor-pointer trasition-all duration-200 bg-gray-100 border-2 border-gray-600 text-gray-800 hover:scale-95 hover:opacity[0.8] ">
              Salvar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}