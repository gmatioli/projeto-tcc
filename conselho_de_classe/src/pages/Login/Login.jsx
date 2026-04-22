import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const [erroLogin, setErroLogin] = useState('');

    useEffect(() => {
      document.title = "Login | Sistema de Conselhos";
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); // Impede a página de recarregar
        
        try {
        // Bate na rota do seu backend Node.js enviando os dados digitados
        const resposta = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: usuario, senha: senha })
        });

        const dados = await resposta.json();

        // Verifica se o Node.js respondeu com { sucesso: true }
        if (dados.sucesso) {
          localStorage.setItem('usuarioLogado', JSON.stringify({ 
            email: usuario, 
            nivelAcesso: dados.nivelAcesso 
          }));
          navigate('/dashboard');

        } else {
          setErroLogin(dados.mensagem);
        }
        
        } catch (erro) {
        console.error("Erro ao conectar com o backend:", erro);
        setErroLogin("Servidor indisponível no momento.");
        }
    };
    
  return (
    
    <div style={containerStyle}>
      <div style={header_logo} className="header_logo">
        <img style={logo} src="/img/logoSenaiS.png" alt="Logo da instituição SENAI" />
      </div>
      <div style={formStyle}>
        <h2 style={h2}>Login</h2>
        <h3 style={h3}>Bem-vindo(a) ao Sistema de Conselhos!</h3>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Email:</label>
          <input 
            placeholder='Digite seu e-mail' 
            type="email" 
            value={usuario} 
            onChange={e => {
              setUsuario(e.target.value);
              setErroLogin(''); // Limpa o erro ao digitar
            }} 
            style={inputStyle} 
            required
          />
          
          <label>Senha:</label>
          <input 
            placeholder='Digite sua senha' 
            type="password" 
            value={senha} 
            onChange={e => {
              setSenha(e.target.value);
              setErroLogin(''); // Limpa o erro ao digitar
            }} 
            style={inputStyle} 
            required
          />

          {/* Exibição do erro de forma simples e direta */}
          {erroLogin && (
            <div style={errorStyle}>
              {erroLogin}
            </div>
          )}

          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    </div>
  );
}

// Estilos simplificados
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', flexDirection: 'column', position:'relative'};
// Mudei height de '380px' para 'auto' para o card se adaptar quando o erro aparecer
const formStyle = { padding: '40px', borderRadius: '8px', backgroundColor: '#f9f9f9', textAlign: 'left', width: '400px', height:'auto', boxSizing: 'border-box' };
// Adicionado boxSizing para o input não vazar da tela
const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '10px', marginTop:'10px', border: 'none', borderRadius: '4px', backgroundColor: '#e20814', color: 'white', cursor: 'pointer' };
const header_logo = {position: 'absolute', top: '20px', left: '20px'}
const h2 = {fontWeight: '700', fontSize:'30px', marginBottom:'10px'}
const h3 = {fontWeight: 'normal', fontSize:'16px', marginBottom:'20px'}
const logo = {width:'350px', height: '70px'}
// Estilo exclusivo para a mensagem de erro
const errorStyle = { color: '#e20814', fontSize: '14px', textAlign: 'center', marginBottom: '10px', fontWeight: '500' };

export default Login;