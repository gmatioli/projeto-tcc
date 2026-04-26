import React, { useState } from 'react';
import './configuracoes.css';
import { useNavigate } from 'react-router-dom';

export function Configuracoes() {
  const navigate = useNavigate();
  
  // Estado para guardar o arquivo selecionado e o status do envio
  const [arquivo, setArquivo] = useState(null);
  const [statusUpload, setStatusUpload] = useState('');

  // Função que captura quando o usuário escolhe um arquivo
  const handleSelecionarArquivo = (event) => {
    setArquivo(event.target.files[0]);
    setStatusUpload(''); // Limpa a mensagem anterior
  };

  // Função que envia o arquivo pro Backend
  const handleEnviarPlanilha = async () => {
    if (!arquivo) {
      setStatusUpload('Por favor, selecione um arquivo primeiro.');
      return;
    }

    setStatusUpload('Enviando e processando... Aguarde.');

    // O FormData é o formato correto para enviar arquivos via fetch
    const formData = new FormData();
    formData.append('arquivo', arquivo); 

    try {
      const resposta = await fetch('http://localhost:3001/upload-planilha', {
        method: 'POST',
        body: formData, 
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        setStatusUpload('✅ ' + dados.mensagem);
        setArquivo(null); // Limpa o input
      } else {
        setStatusUpload('❌ Erro: ' + dados.mensagem);
      }
    } catch (erro) {
      console.error("Erro no upload:", erro);
      setStatusUpload('❌ Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="configuracoes-wrapper">
      <h2 className="titulo-pagina">Configurações</h2>

      <div className="card-config">
        <h3 className="titulo-card">Configurações do Sistema</h3>

        <div className="grid-config">
          {/* Coluna da Esquerda (Uploads) */}
          <div className="coluna-esq">
            <div className="grupo-input">
              <label>Carregar Planilha SGSET:</label>
              <div className="input-falso">
                <input type="file"accept=".csv" onChange={handleSelecionarArquivo} style={{ marginBottom: '10px'}} />

                <button 
                className="btn-atualizar" 
                onClick={handleEnviarPlanilha}
                disabled={!arquivo} // Botão desativado se não tiver arquivo
                style={{ width: '100%' }}
               >
                Processar Planilha
              </button>
              
              {/* Mostra mensagem de sucesso ou erro */}
              {statusUpload && <p style={{ fontSize: '14px', marginTop: '5px', fontWeight: 'bold' }}>{statusUpload}</p>}


              </div>
            </div>

            <div className="grupo-input">
              <label>Carregar Backup Database:</label>
              <select className="input-select">
                <option value="">Selecione um backup...</option>
                <option value="backup1">Backup - 10/04/2026</option>
              </select>
            </div>
          </div>

          {/* Coluna da Direita (Ações) */}
          <div className="coluna-dir">
            <div className="linha-acao">
              <label>Cadastrar Novo Usuário:</label>
              <button className="btn-acao" onClick={() => navigate('/cadastrarusuario')}>Cadastrar</button>
            </div>
            
            <div className="linha-acao">
              <label>Recuperar/Alterar Senha:</label>
              <button className="btn-acao"  onClick={() => navigate('/recuperarsenha')}>Recuperar</button>
            </div>
            
            <div className="linha-acao">
              <label>Atribuir Turma a Docente:</label>
              <button className="btn-acao" onClick={() => navigate('/atribuirturma')}>Atribuir</button>
            </div>
          </div>
        </div>

        {/* Botões do Rodapé */}
        <div className="rodape-acoes">
          <button className="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}