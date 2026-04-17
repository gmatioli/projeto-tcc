import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();


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
            body: JSON.stringify({ usuario: usuario, senha: senha })
        });

        const dados = await resposta.json();

        // Verifica se o Node.js respondeu com { sucesso: true }
        if (dados.sucesso) {
            navigate('/conselhointermediario'); // Senha certa! Vai pra tela do Conselho
        } else {
            alert(dados.mensagem);  // Senha errada! Mostra o erro do Node.js
        }
        
        } catch (erro) {
        console.error("Erro ao conectar com o backend:", erro);
        alert("Servidor indisponível no momento.");
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
        <form onSubmit={handleLogin}>
          <label>Email:</label>
          <input placeholder='Digite seu e-mail' type="text" value={usuario} onChange={e => setUsuario(e.target.value)} style={inputStyle} />
          <label>Senha:</label>
          <input placeholder='Digite sua senha' type="password" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    </div>
  );
}

// Estilos simplificados (reproduzindo image_0.png)
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', flexDirection: 'column', position:'relative'};
const formStyle = { padding: '40px', borderRadius: '8px', backgroundColor: '#f9f9f9', textAlign: 'left', width: '400px', height:'380px' };
const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ccc' };
const buttonStyle = { width: '100%', padding: '10px', marginTop:'20px', border: 'none', borderRadius: '4px', backgroundColor: '#e20814', color: 'white', cursor: 'pointer' };
const header_logo = {position: 'absolute', top: '20px', left: '20px'}
const h2 = {fontWeight: '700', fontSize:'30px', marginBottom:'10px'}
const h3 = {fontWeight: 'normal', fontSize:'16px', marginBottom:'20px'}
const logo = {width:'350px', height: '70px'}

export default Login;