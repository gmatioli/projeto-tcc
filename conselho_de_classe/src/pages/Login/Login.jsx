import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const [erroLogin, setErroLogin] = useState('');

    useEffect(() => {
      document.title = "Sistema de Conselhos";
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); // Impede a página de recarregar
        setCarregando(true);

        try {
        // Bate na rota do seu backend Node.js enviando os dados digitados
        const emailLower = usuario.trim().toLowerCase();
        const resposta = await fetch(API.login, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailLower, senha: senha })
        });

        const dados = await resposta.json();

        // Verifica se o Node.js respondeu com { sucesso: true }
        if (dados.sucesso) {
          localStorage.setItem('usuarioLogado', JSON.stringify({
            token: dados.token, 
            idUsuario: dados.idUsuario,
            nomeUsuario: dados.nomeUsuario,
            email: emailLower,
            nivelAcesso: dados.nivelAcesso
          }));
          
        
          navigate('/home');
          
          

        } else {
          setErroLogin(dados.mensagem);
          setCarregando(false); 

        }
        
        } catch (erro) {
        setErroLogin("Servidor indisponível no momento.");
        setCarregando(false); 
        }
    };
    
  return (
    
  <div className={`flex flex-col justify-center items-center h-screen bg-gray-100 relative${carregando ? ' cursor-wait' : ''}`}>      <div className="absolute top-5 left-10">
        <img className="mt-5 ml-2" src="/img/LogoLogin.png" alt="Logo da instituição SENAI" />
      </div>
      <div className="p-10 rounded-lg bg-[#f9f9f9] text-left w-[400px] h-auto shadow-2xl">
        <h2 className="font-bold text-3xl mb-2.5">Login</h2>
        <h3 className="font-normal text-base mb-5">Bem-vindo(a) ao Sistema de Conselhos!</h3>
        
        <form onSubmit={handleLogin} className='flex flex-col'>
          <label>Email:</label>
          <input 
            className="w-full p-2.5 mt-[5px] mb-[15px] rounded border border-[#ccc]"
            placeholder='Digite seu e-mail' 
            type="email" 
            value={usuario} 
            onChange={e => {
              setUsuario(e.target.value.toLowerCase());
              setErroLogin(''); // Limpa o erro ao digitar
            }} 
            required
          />
          
          <label>Senha:</label>
          <input 
            className="w-full p-2.5 mt-[5px] mb-[15px] rounded border border-[#ccc]"
            placeholder="Digite sua senha" 
            type="password" 
            value={senha} 
            onChange={e => {
              setSenha(e.target.value);
              setErroLogin(''); // Limpa o erro ao digitar
            }}
            required
          />

          {/* Exibição do erro de forma simples e direta */}
          {erroLogin && (
            <div className="text-[#e20814] text-sm text-center mb-2.5 font-medium">
              {erroLogin}
            </div>
          )}

         <button
          type="submit"
          disabled={carregando}
          className={`w-full p-2.5 mt-2.5 border-none rounded text-white flex items-center justify-center gap-2 transition-opacity ${
            carregando ? 'bg-[#e20814] opacity-70 cursor-wait' : 'bg-[#e20814] cursor-pointer'
          }`}
        >
          {carregando ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando
            </>
          ) : 'Login'}
        </button>
        </form>
      </div>
    </div>
  );
}

export default Login;