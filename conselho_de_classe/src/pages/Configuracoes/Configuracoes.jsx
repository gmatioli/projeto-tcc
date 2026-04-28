import React, { useState } from 'react';
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

  // Função para simular o download do backup
  const handleDownloadBackup = () => {
    alert("Iniciando download do backup do banco de dados...");
  };

  // Função para limpar o arquivo selecionado
  const handleLimparArquivo = () => {
    setArquivo(null);
    setStatusUpload('');
    // Isso aqui limpa o texto "nome-do-arquivo.csv" que fica escrito no input
    document.getElementById('input-csv').value = ''; 
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col p-4 sm:p-6 bg-gray-100 custom-scrollbar">
      
      <h2 className="text-sm font-bold text-gray-700 mb-4 ">Configurações</h2>

      <div className="flex-1 bg-white border border-gray-300 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Configurações do Sistema</h3>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12 flex-1">
          
          {/* Coluna da Esquerda (Upload e Backup) */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <label className="block text-lg font-semibold text-gray-800 mb-1">Carregar Planilha SGSET</label>
              <p className="text-sm text-gray-500 mb-4">Selecione o arquivo .csv exportado do sistema para atualizar a base de alunos.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                
                {/* Envolvemos o input e o X nessa div relativa */}
                <div className="relative flex items-center w-full">
                  <input 
                    id="input-csv"
                    type="file" 
                    accept=".csv" 
                    onChange={handleSelecionarArquivo} 
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border file:border-red-300
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-[#E20814]
                      hover:file:bg-red-100 hover:file:border-red-400 
                      file:cursor-pointer cursor-pointer
                      border border-gray-300 rounded-lg bg-white transition-all pr-10"
                  />
                  
                  {/* O X mágico que só aparece se tiver arquivo escolhido */}
                  {arquivo && (
                    <button
                      type="button"
                      onClick={handleLimparArquivo}
                      className="absolute right-3 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remover arquivo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <button
                  className="w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-bold transition-all bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEnviarPlanilha}
                  disabled={!arquivo}
                >
                  Carregar
                </button>
              </div>
              
              {statusUpload && (
                <p className={`mt-3 text-sm font-medium ${statusUpload.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
                  {statusUpload}
                </p>
              )}
            </div>

            {/* Seção Backup */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <label className="block text-lg font-semibold text-gray-800 mb-1">Backup do Banco de Dados</label>
              <p className="text-sm text-gray-500 mb-4">Gere e faça o download de uma cópia de segurança de todos os dados atuais do sistema.</p>
              
              <button 
                onClick={handleDownloadBackup}
                className="flex items-center justify-center sm:justify-start gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm w-full sm:w-max"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Fazer Download do Backup
              </button>
            </div>

          </div>

          {/* Coluna da Direita - Removido o esticamento, usando apenas gap-4 para juntar os cards */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-1">Ações de Gerenciamento</h4>

            {/* Flex column simples com gap-4 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <span className="text-gray-700 font-medium text-sm">Cadastrar Novo Usuário</span>
                <button 
                  onClick={() => navigate('/cadastrarusuario')}
                  className="w-[120px] py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-[#E20814] transition-colors text-center"
                >
                  Cadastrar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <span className="text-gray-700 font-medium text-sm">Recuperar/Alterar Senha</span>
                <button 
                  onClick={() => navigate('/recuperarsenha')}
                  className="w-[120px] py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-[#E20814] transition-colors text-center"
                >
                  Recuperar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <span className="text-gray-700 font-medium text-sm">Atribuir Turma a Docente</span>
                <button 
                  onClick={() => navigate('/atribuirturma')}
                  className="w-[120px] py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-[#E20814] transition-colors text-center"
                >
                  Atribuir
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}