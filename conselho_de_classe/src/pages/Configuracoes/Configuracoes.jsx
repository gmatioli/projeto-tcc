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
    <div className="px-10 py-5 w-full box-border h-full flex flex-col">
      <h2 className="text-[20px] ml-[10px] font-medium text-[#333] mb-[20px]">Configurações</h2>

      <div  className="bg-[#f8f9fa] border border-[#ccc] rounded-[16px] p-[60px] h-[90%] w-full m-auto flex flex-col">
        <h3 className="text-[28px] font-bold text-[#333] mb-[60px]">Configurações do Sistema</h3>

        <div className="flex justify-between gap-[100px] mt-[50px] mb-[50px]">
          {/* Coluna da Esquerda (Uploads) */}
          <div className="flex-1 flex flex-col justify-around gap-[25px]">
            <div className="">
              <label className="block text-[22px] mb-[8px] text-black">Carregar Planilha SGSET:</label>
              <div className="flex justify-between w-full h-[80px] px-[15px] py-[10px] border border-[#777] rounded-[8px] bg-white text-[14px] text-[#555] box-border items-center cursor-pointer">
                <input type="file"accept=".csv" onChange={handleSelecionarArquivo} className="border border-gray-500 p-3 pr-[70px] rounded-[10px] t" />

             <button
                className="px-8  py-[10px] ml-3 rounded-[8px] text-[14px] cursor-pointer bg-[#E32623] border border-[#c82333] text-white font-bold"
                onClick={handleEnviarPlanilha}
                disabled={!arquivo}>
                Carregar
              </button>
              
              {/* Mostra mensagem de sucesso ou erro */}
              {statusUpload && <p style={{ fontSize: '14px', marginTop: '5px', fontWeight: 'bold' }}>{statusUpload}</p>}


              </div>
            </div>

            <div className="grupo-input">
              <label  className="block text-[22px] mb-[8px] text-black">Carregar Backup Database:</label>
              <select  className="w-full h-[80px] px-[15px] py-[10px] border border-[#777] rounded-[8px] bg-white text-[14px] text-[#555] box-border">
                <option value="">Selecione um backup...</option>
                <option value="backup1">Backup - 10/04/2026</option>
              </select>
            </div>
          </div>

          {/* Coluna da Direita (Ações) */}
          <div className="flex-1 flex flex-col justify-around gap-[25px]">
            <div className="flex justify-center items-center">
              <label className="text-[20px] text-black w-[260px] text-justify">Cadastrar Novo Usuário:</label>
              <button className="p-[8px] border border-[#777] rounded-[15px] bg-[#e9ecef] text-[#242323] cursor-pointer text-[18px] w-[300px] h-[50px] hover:bg-[#E32623] hover:text-[#f8f9fa]" onClick={() => navigate('/cadastrarusuario')}>Cadastrar</button>
            </div>
            
            <div className="flex justify-center items-center">
              <label className="text-[20px] text-black w-[260px] text-justify">Recuperar/Alterar Senha:</label>
              <button className="p-[8px] border border-[#777] rounded-[15px] bg-[#e9ecef] text-[#242323] cursor-pointer text-[18px] w-[300px] h-[50px] hover:bg-[#E32623] hover:text-[#f8f9fa]"  onClick={() => navigate('/recuperarsenha')}>Recuperar</button>
            </div>
            
            <div className="flex justify-center items-center">
              <label className="text-[20px] text-black w-[260px] text-justify">Atribuir Turma a Docente:</label>
              <button className="p-[8px] border border-[#777] rounded-[15px] bg-[#e9ecef] text-[#242323] cursor-pointer text-[18px] w-[300px] h-[50px] hover:bg-[#E32623] hover:text-[#f8f9fa]" onClick={() => navigate('/atribuirturma')}>Atribuir</button>
            </div>
          </div>
        </div>

        {/* Botões do Rodapé */}
        <div className="flex justify-center gap-[100px] mt-[20px]">
          <button  className="px-[80px] py-[20px] rounded-[8px] text-[14px] cursor-pointer bg-[#e9ecef] border border-[#777] text-[#333] ">Cancelar</button>
        </div>
      </div>
    </div>
  );
}