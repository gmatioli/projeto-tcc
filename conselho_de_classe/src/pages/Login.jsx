import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

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
            navigate('/dashboard'); // Senha certa! Vai pra tela do Conselho
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
      <div style={formStyle}>
        <h2>Login</h2>
        <h3>Bem-vindo(a) ao Portal SENAI-SP!</h3>
        <form onSubmit={handleLogin}>
          <label>Usuário:</label>
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} style={inputStyle} />
          <label>Senha:</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    </div>
  );
}

// Estilos simplificados (reproduzindo image_0.png)
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' };
const formStyle = { padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', textAlign: 'left', width: '300px' };
const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ccc' };
const buttonStyle = { width: '100%', padding: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#e74c3c', color: 'white', cursor: 'pointer' };

export default Login;