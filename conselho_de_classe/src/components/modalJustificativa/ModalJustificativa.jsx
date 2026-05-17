import { useState, useEffect } from "react";


const ModalJustificativa = ({ isOpen, onClose, aluno, situacao, contestacaoInicial, soLeitura, onSalvar }) => {

    const [contentacao, setContentacao] = useState('');

    useEffect(() => {
      if (isOpen) setContentacao(contestacaoInicial || '');

    }, [isOpen, aluno, contestacaoInicial]);

    if (!isOpen) return null;

    const handleSalvar = () => {
      if(!contentacao.trim()) return;
      onSalvar(contentacao.trim());
    }

    const corSituacao = situacao === 'Reprovado' ? 'text-red-600' : 'text-yellow-600';

    return (
      // Fundo escuro do modal
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
        {/* Caixa branca do formulário */}
        <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
          <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Contestação </h2>
            <p className={`text-center text-xl font-semibold mb-2 ${corSituacao}`}>{situacao}</p>
          <hr className="border-none bg-gray-300 h-[1px] mx-20 py-[1px]"/>
            
          <form className="flex flex-col gap-12 mx-20 ">
          <label className="mt-8 text-2xl">{`Aluno(a): ${aluno?.nome || ''}`}</label>
          <textarea className={`w-full h-[400px] border border-black rounded-[20px] text-3xl p-4 ${soLeitura
           ? 'bg-gray-50 cursor-default' : ''}`}
            id="text_area" 
            value={contentacao}
            onChange={soLeitura ? undefined : (e) => setContentacao(e.target.value)}
            placeholder={soLeitura ? '' : 'Descreva a contestação do conselho'}
            readOnly={soLeitura}>
          </textarea>
            
            <div className="flex justify-center items-end gap-[50px] mt-10">
              <button type="button" onClick={onClose}
               className="py-4 px-[180px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
                {soLeitura ? 'Fechar' : 'Cancelar'}
              </button>
              {!soLeitura && (
              <button type="button" onClick={handleSalvar} 
              className={`py-4 px-[180px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer trasition-all duration-200 active:scale-95
                ${!contentacao.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E53935] cursor-pointer'}
                
                `}>
                Salvar
              </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default ModalJustificativa;
  