import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import './senha.css'

export function Senha() {
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Estados do Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    
    // Estados do Formulário de Senha
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erroSenha, setErroSenha] = useState('');
    const [gatilhoAnimacao, setGatilhoAnimacao] = useState(0);

    // 1. Busca os usuários assim que a tela abre
    useEffect(() => {
        document.title = "Recuperar Senha | Sistema de Conselhos";
        buscarUsuarios();
    }, []);

    const buscarUsuarios = async () => {
    try {
      const resposta = await fetch('http://localhost:3001/usuarios');
      const dados = await resposta.json();
      if (dados.sucesso) {
        setUsuarios(dados.usuarios);
      }
    } catch (erro) {
      console.error("Erro ao buscar usuários:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Abre o modal e guarda quem foi clicado
  const abrirModal = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNovaSenha('');
    setConfirmaSenha('');
    setErroSenha('');
    setModalAberto(true);
  };

  // 3. Fecha o modal
  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioSelecionado(null);
  };

  // 4. Salva a nova senha
  const handleAtualizarSenha = async (e) => {
    e.preventDefault();

    // Validações
    if (novaSenha.length < 8) {
      setErroSenha('A senha deve ter no mínimo 8 caracteres.');
      setGatilhoAnimacao(prev => prev + 1);
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setErroSenha('As senhas não coincidem.');
      setGatilhoAnimacao(prev => prev + 1);
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3001/usuarios/senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idUsuario: usuarioSelecionado.idUsuario, 
          novaSenha: novaSenha 
        })
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        alert("Senha atualizada com sucesso!");
        fecharModal();
      } else {
        setErroSenha(dados.mensagem);
        setGatilhoAnimacao(prev => prev + 1);
      }
    } catch (erro) {
      console.error("Erro ao atualizar senha:", erro);
      setErroSenha("Erro de conexão com o servidor.");
      setGatilhoAnimacao(prev => prev + 1);
    }
  };

  return (
    <div className="rec-wrapper">
      <header className="rec-header">
        <img src="/img/logo-senai.png" alt="Logo SENAI" className="logo-senai" />
      </header>

      <main className="rec-card">
        <div className="rec-titulo-container">
          <hr className="rec-linha" />
          <h1 className="rec-titulo">RECUPERAR SENHA</h1>
          <hr className="rec-linha" />
        </div>

        <div className="rec-lista-container">
          <p className="rec-label">Usuários:</p>
          <div className="rec-box-lista">
            {carregando ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>
            ) : (
              <ul className="rec-lista">
                {usuarios.map(usuario => (
                  <li key={usuario.idUsuario} className="rec-item-lista">
                    <span>{usuario.nomeUsuario}</span>
                    <button 
                      onClick={() => abrirModal(usuario)} 
                      className="btn-icone"
                      title="Editar Senha"
                    >
                      {/* Ícone de Lápis em SVG */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rec-rodape">
          <hr className="rec-linha-rodape" />
          <button className="btn-fechar-lista" onClick={() => navigate('/configuracoes')}>
            Fechar
          </button>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO (Só aparece se modalAberto for true) */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-subtitulo">
              <strong>Usuário Selecionado:</strong> {usuarioSelecionado?.nomeUsuario}
            </h3>
            
            <form onSubmit={handleAtualizarSenha} className="modal-form">
              <div className="grupo-input">
                <label>Nova Senha:</label>
                <input 
                  type="password" 
                  value={novaSenha}
                  onChange={(e) => { setNovaSenha(e.target.value); setErroSenha(''); }}
                  required
                />
              </div>
              
              <div className="grupo-input">
                <label>Confirmar Senha:</label>
                <input 
                  type="password" 
                  value={confirmaSenha}
                  onChange={(e) => { setConfirmaSenha(e.target.value); setErroSenha(''); }}
                  required
                />
              </div>

              {/* Aproveitando a animação de pulso que criamos antes! */}
              <div style={{ textAlign: 'center', minHeight: '20px', marginBottom: '15px' }}>
                {erroSenha && (
                  <span key={gatilhoAnimacao} className="mensagem-erro">
                    {erroSenha}
                  </span>
                )}
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-atualizar">
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

