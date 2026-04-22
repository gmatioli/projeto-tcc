import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cadastro.css'; 

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
  const [senhaForteErro, setSenhaForteErro] = useState(''); // NOVO: Erro para o tamanho da senha
  const [senhaErro, setSenhaErro] = useState('');           // Erro para senhas diferentes

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
      const resposta = await fetch('http://localhost:3001/cadastro', {
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
        navigate('/'); 
      } else {
        alert(dados.mensagem); 
      }

    } catch (erro) {
      console.error("Erro ao conectar com o backend:", erro);
      alert("Servidor indisponível no momento.");
    }
  };

  return (
    <div className="cadastro-wrapper">
      
      <header className="cadastro-header">
        <img src="/img/logo-senai.png" alt="Logo SENAI" className="logo-senai" />
        <h1 className="titulo-cadastro">CADASTRO DE USUÁRIO</h1>
      </header>

      <main className="cadastro-card">
        <form onSubmit={handleCadastro}>
          
          <div className="linha-form">
            <div className="grupo-input">
              <label>Nome Completo:</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>
            <div className="grupo-input">
              <label>Tipo de acesso:</label>
              <select 
                value={tipoAcesso} 
                onChange={(e) => setTipoAcesso(e.target.value)} 
                required
              >
                <option value="">Selecione...</option>
                <option value="docente">Docente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="linha-form">
            <div className="grupo-input full-width">
              <label>Email Institucional:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErro(''); 
                }} 
                onBlur={validarEmail} 
                required 
              />
              {emailErro && <span key={`email-${gatilhoAnimacao}`} className="mensagem-erro">{emailErro}</span>}
            </div>
          </div>

          <div className="linha-form align-start">
            
            {/* CAMPO DE SENHA (AGORA COM O AVISO PULSANTE DE 8 CARACTERES) */}
            <div className="grupo-input">
              <label>Senha:</label>
              <input 
                type="password" 
                value={senha} 
                onChange={(e) => {
                  setSenha(e.target.value);
                  setSenhaForteErro(''); // Limpa o erro ao digitar
                }} 
                onBlur={validarSenhaForte} // Valida quando o usuário clica fora da caixa
                required 
              />
              {/* O alerta de 8 caracteres só aparece aqui se der erro! */}
              {senhaForteErro && <span key={`senhaForte-${gatilhoAnimacao}`} className="mensagem-erro">{senhaForteErro}</span>}
            </div>
            
            {/* CAMPO DE CONFIRMAR SENHA */}
            <div className="grupo-input">
              <label>Confirme sua senha:</label>
              <input 
                type="password" 
                value={confirmaSenha} 
                onChange={(e) => {
                  setConfirmaSenha(e.target.value);
                  setSenhaErro(''); 
                }} 
                onBlur={validarSenhasIguais} 
                required 
              />
              {senhaErro && <span key={`senhaConfirma-${gatilhoAnimacao}`} className="mensagem-erro">{senhaErro}</span>}
            </div>
          </div> 

          <div className="acoes-form">
            <button 
              type="button" 
              className="btn-voltar-cad" 
              onClick={() => navigate("/configuracoes")}
            >
              Voltar
            </button>
            <button type="submit" className="btn-enviar-cad">
              Cadastrar
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}