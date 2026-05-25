import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { API, authFetch } from '../../config/api';

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
      const resposta = await authFetch(API.usuarios);
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
      const resposta = await authFetch(`${API.usuarios}/senha`, {
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
    <div className="min-h-screen flex flex-col bg-white relative">
      
      {/* Estilo injetado para a animação de erro pulsante */}
      <style>
        {`
          @keyframes pulsarErro {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); color: #ff0000; font-weight: bold; }
            100% { transform: scale(1); }
          }
          .animacao-erro {
            display: inline-block;
            animation: pulsarErro 0.4s ease-in-out;
            transform-origin: center center;
          }
        `}
      </style>

      {/* Cabeçalho */}
      <header className="absolute w-full pt-5 pl-[50px] top-0 left-0">
        <img src="/img/logo-senai.png" alt="Logo SENAI" className="h-[45px] mt-2" />
      </header>

      {/* Conteúdo Principal Centralizado */}
      <main className="flex-1 flex flex-col justify-center items-center px-4">
        
        {/* Card Cinza Principal */}
        <div className="w-full max-w-4xl bg-[#E9E9E9] rounded-2xl p-10 shadow-lg">
          
          {/* Título com as linhas nas laterais */}
          <div className="flex items-center gap-4 mb-8">
            <hr className="flex-1 border-t border-gray-400" />
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide m-0">
              Recuperar Senha
            </h1>
            <hr className="flex-1 border-t border-gray-400" />
          </div>

          {/* Lista de Usuários */}
          <div className="mb-10">
            <p className="font-bold text-sm text-gray-800 mb-2">Usuários:</p>
            <div className="bg-white border border-gray-400 rounded-xl overflow-hidden shadow-sm">
              {carregando ? (
                <p className="p-6 text-center text-gray-600">Carregando...</p>
              ) : (
                <ul className="m-0 p-0 max-h-[350px] overflow-y-auto">
                  {usuarios.map(usuario => (
                    <li key={usuario.idUsuario} className="flex justify-between items-center px-6 py-4 border-b border-gray-300 last:border-b-0 text-sm text-gray-700">
                      <span>{usuario.nomeUsuario}</span>
                      <button 
                        onClick={() => abrirModal(usuario)} 
                        className="text-gray-500 hover:text-[#E20814] transition-colors p-1"
                        title="Editar Senha"
                      >
                        {/* Ícone de Lápis em SVG */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Rodapé com botão fechar */}
          <div className="flex flex-col items-center gap-6">
            <hr className="w-full border-t border-gray-400" />
            <button 
              onClick={() => navigate('/configuracoes')}
              className="px-10 py-2 rounded-full border border-gray-400 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </main>

      {/* ========================================= */}
      {/* MODAL DE EDIÇÃO (Aparece se modalAberto)  */}
      {/* ========================================= */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          
          {/* Conteúdo do Modal */}
          <div className="bg-white rounded-2xl w-full max-w-[500px] p-8 shadow-2xl relative">
            
            <h3 className="text-sm text-gray-800 mb-6">
              <span className="font-bold">Usuário Selecionado:</span> {usuarioSelecionado?.nomeUsuario}
            </h3>
            
            <form onSubmit={handleAtualizarSenha} className="flex flex-col gap-5">
              
              {/* Input Nova Senha */}
              <div className="flex flex-col">
                <label className="font-bold text-sm text-gray-800 mb-1">Nova Senha:</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={novaSenha}
                    onChange={(e) => { setNovaSenha(e.target.value); setErroSenha(''); }}
                    required
                    className="w-full border border-gray-400 rounded-lg p-2.5 outline-none text-sm bg-[#F8F9FA] focus:border-gray-600 transition-colors pr-10"
                  />
                  {/* Ícone de olho riscado (Apenas visual para bater com o protótipo) */}
                  <svg className="absolute right-3 top-3 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
              </div>
              
              {/* Input Confirmar Senha */}
              <div className="flex flex-col">
                <label className="font-bold text-sm text-gray-800 mb-1">Confirmar Senha:</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={confirmaSenha}
                    onChange={(e) => { setConfirmaSenha(e.target.value); setErroSenha(''); }}
                    required
                    className="w-full border border-gray-400 rounded-lg p-2.5 outline-none text-sm bg-[#F8F9FA] focus:border-gray-600 transition-colors pr-10"
                  />
                  {/* Ícone de olho riscado (Apenas visual para bater com o protótipo) */}
                  <svg className="absolute right-3 top-3 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
              </div>

              {/* Mensagem de Erro Pulsante */}
              <div className="text-center min-h-[24px]">
                {erroSenha && (
                  <span key={gatilhoAnimacao} className="text-[#e3352f] text-sm font-medium animacao-erro">
                    {erroSenha}
                  </span>
                )}
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-between gap-4 mt-2">
                <button 
                  type="button" 
                  onClick={fecharModal}
                  className="flex-1 py-2.5 bg-[#e5e5e5] border border-gray-400 rounded-full text-gray-800 font-semibold hover:bg-[#d4d4d4] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#E20814] text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
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