import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './perfil.css';
import { VscAccount } from "react-icons/vsc";
import { VscGitStashPop } from "react-icons/vsc";


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
          const resposta = await fetch(`http://localhost:3001/perfil/${email}`);
          const dados = await resposta.json();

          if (dados.sucesso) {
            // A MÁGICA ACONTECE AQUI: Fazemos o "de/para" com os novos nomes do banco!
            setDadosUsuario({
              nome: dados.usuario.nomeUsuario,             // Lendo a nova coluna do banco
              email: dados.usuario.emailInstitucional,     // Lendo a nova coluna do banco
              nivelAcesso: dados.usuario.nivelAcesso === 'admin' ? 'Administrador' : 'Docente'
            });
          } else {
             setDadosUsuario(prev => ({ ...prev, nome: "Usuário não encontrado" }));
          }
        } catch (erro) {
          console.error("Erro de conexão:", erro);
          setDadosUsuario(prev => ({ ...prev, nome: "Erro no servidor" }));
        }
      } else {
        navigate('/'); 
      }
    };

    carregarPerfil();
  }, [navigate]);

  return (
    <div className="perfil-wrapper">
      <h2 className="perfil-titulo-pagina">Perfil</h2>

      <div className="perfil-card">
        
        {/* COLUNA DA ESQUERDA: FOTO */}
        <div className="perfil-coluna-esq">
          <div className="perfil-circulo-foto">
           <VscAccount size={140} color={"#747272ff"} />

          </div>
          
          <button className="btn-carregar-foto">
            Carregar Foto  
            
            <VscGitStashPop size={20} />

          </button>
        </div>

        {/* COLUNA DA DIREITA: DADOS DO BANCO */}
        <div className="perfil-coluna-dir">
          <div className="perfil-info-item">
            <strong>Nome:</strong> <span>{dadosUsuario.nome}</span>
          </div>
          
          <div className="perfil-info-item">
            <strong>E-mail:</strong> <span>{dadosUsuario.email}</span>
          </div>
          
          <div className="perfil-info-item">
            <strong>Nível de Acesso:</strong> <span>{dadosUsuario.nivelAcesso}</span>
          </div>
          
      

          <div className="perfil-acoes">
            <button className="btn-fechar-perfil" onClick={() => navigate('/dashboard')}>
              Fechar
            </button>
            <button className="btn-salvar-perfil">
              Salvar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}