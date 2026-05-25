import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';

export function Cadastro() {
  const navigate = useNavigate();
  
  // Estados para guardar o que o usuário digitar
  const [nome, setNome] = useState('');
  const [tipoAcesso, setTipoAcesso] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // Estados exclusivos para as mensagens de erro pulsantes
  const [emailErro, setEmailErro] = useState('');
  const [senhaForteErro, setSenhaForteErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');   
  const [mensagem, setMensagemSucesso] = useState('');

  const [gatilhoAnimacao, setGatilhoAnimacao] = useState(0);

  // Para mudar título da página
  useEffect(() => {
    document.title = "Cadastro de Usuário | Sistema de Conselhos";
  }, []);

  // 1. VALIDAÇÃO DO EMAIL
  const validarEmail = () => {
    if (!email) {
      setEmailErro('O email institucional é obrigatório.');
      return false;
    }
    
  const emailValido = email.toLowerCase();
    if (!emailValido.includes('@') || !emailValido.includes('senai')) {
      setEmailErro('Por favor, utilize um email institucional válido do SENAI.');
      return false; 
    } else {
      setEmailErro(''); 
      return true;
    }
  };

  // 2. NOVA VALIDAÇÃO: TAMANHO DA SENHA
  const validarSenhaForte = () => {
    if (senha && senha.length < 8) {
      setSenhaForteErro('A senha deve conter no mínimo 8 caracteres.');
      return false;
    } else {
      setSenhaForteErro('');
      return true;
    }
  };

  // 3. VALIDAÇÃO DAS SENHAS IGUAIS
  const validarSenhasIguais = () => {
    if (!confirmaSenha) {
      setSenhaErro('Por favor, confirme sua senha.');
      return false;
    }
    if (senha !== confirmaSenha) {
      setSenhaErro('As senhas não coincidem. Verifique a digitação.');
      return false;
    } else {
      setSenhaErro(''); 
      return true;
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault(); 

    // Dispara todas as verificações
    const emailEstaCerto = validarEmail();
    const senhaForte = validarSenhaForte();
    const senhasBatem = validarSenhasIguais();

    // Se qualquer uma falhar, bloqueia e gira o gatilho da animação!
    if (!emailEstaCerto || !senhaForte || !senhasBatem) {
        setGatilhoAnimacao(prev => prev + 1); 
        return; 
    }

    try {
      const resposta = await fetch(API.cadastro, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nome: nome, 
          email: email, 
          senha: senha, 
          tipoAcesso: tipoAcesso 
        })
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        setMensagemSucesso('Cadastro realizado com sucesso!')
        handleLimparFiltro();
        setTimeout(() => {
        setMensagemSucesso('')

        }, 3000);
      } else {
        alert(dados.mensagem); 
      }

    } catch (erro) {
      console.error("Erro ao conectar com o backend:", erro);
      alert("Servidor indisponível no momento.");
    }
  };

  const handleLimparFiltro = () => {
    setNome("");
    setTipoAcesso("");
    setEmail("");
    setSenha("");
    setConfirmaSenha("");

  };

  return (
  <div className={`min-h-screen flex flex-col bg-white ${mensagem !== '' ? 'cursor-wait' : ''}`}>      
  {/* Injeção do Keyframe de animação para não depender de CSS externo */}
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
            transform-origin: left center;
          }
        `}
      </style>
      
      <header className="absolute w-full pt-5 pl-[50px] top-0 left-0 ">
        <img src="/img/logo-senai.png" alt="Logo SENAI" className="h-[45px] mt-2" />
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 ">
        
        
        <div className="w-full max-w-4xl bg-gray-200 rounded-xl p-10 shadow-2xl">
          <h1 className="text-2xl text-center font-bold text-gray-800 uppercase mb-8 tracking-wide">
          Cadastro de Usuário
          </h1>

          <form onSubmit={handleCadastro} className="flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col flex-1">
                <label className="text-base font-medium mb-2 text-gray-900">Nome Completo:</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required 
                  className="w-full border border-gray-400 rounded-2xl p-3 outline-none text-base bg-white focus:border-gray-600 transition-colors"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-base font-medium mb-2 text-gray-900">Tipo de acesso:</label>
                <select 
                  value={tipoAcesso} 
                  onChange={(e) => setTipoAcesso(e.target.value)} 
                  required
                  className="w-full border border-gray-400 rounded-2xl p-3 outline-none text-base bg-white focus:border-gray-600 transition-colors"
                >
                  <option value="" disabled hidden>Selecione</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label className="text-base font-medium mb-2 text-gray-900">Email Institucional:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErro(''); 
                }} 
                onBlur={validarEmail} 
                required 
                className="w-full border border-gray-400 rounded-2xl p-3 outline-none text-base bg-white focus:border-gray-600 transition-colors"
              />
              {emailErro && (
                <span key={`email-${gatilhoAnimacao}`} className="text-[#e3352f] text-sm mt-2 font-medium pl-1 animacao-erro">
                  {emailErro}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col flex-1 w-full">
                <label className="text-base font-medium mb-2 text-gray-900">Senha:</label>
                <input 
                  type="password" 
                  value={senha} 
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setSenhaForteErro(''); 
                  }} 
                  onBlur={validarSenhaForte} 
                  required 
                  className="w-full border border-gray-400 rounded-2xl p-3 outline-none text-base bg-white focus:border-gray-600 transition-colors"
                />
                {senhaForteErro && (
                  <span key={`senhaForte-${gatilhoAnimacao}`} className="text-[#e3352f] text-sm mt-2 font-medium pl-1 animacao-erro">
                    {senhaForteErro}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col flex-1 w-full">
                <label className="text-base font-medium mb-2 text-gray-900">Confirme sua senha:</label>
                <input 
                  type="password" 
                  value={confirmaSenha} 
                  onChange={(e) => {
                    setConfirmaSenha(e.target.value);
                    setSenhaErro(''); 
                  }} 
                  onBlur={validarSenhasIguais} 
                  required 
                  className="w-full border border-gray-400 rounded-2xl p-3 outline-none text-base bg-white focus:border-gray-600 transition-colors"
                />
                {senhaErro && (
                  <span key={`senhaConfirma-${gatilhoAnimacao}`} className="text-[#e3352f] text-sm mt-2 font-medium pl-1 animacao-erro">
                    {senhaErro}
                  </span>
                )}
              </div>
            </div> 

            {mensagem && (
              <div className="text-green-600 text-center font-semibold mt-1 cursor-wait">
                {mensagem}
              </div>
            )}

            <div className="flex justify-center gap-6 mt-4">
              <button 
                type="button" 
                onClick={() => navigate("/configuracoes")}
                className="w-60 py-2 rounded-2xl border border-gray-500 bg-[#e9ecef] text-gray-800 font-semibold hover:bg-[#d6d8db] transition-colors"
              >
                Voltar
              </button>
              <button 
                type="submit" 
                disabled={mensagem !== '' }
                className="w-60 py-2 rounded-2xl bg-[#E20814] border border-black text-white font-semibold hover:bg-red-700 transition-colors border border-transparent "
              >
                
                Cadastrar
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}