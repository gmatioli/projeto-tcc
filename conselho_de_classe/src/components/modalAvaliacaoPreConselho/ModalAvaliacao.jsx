const ModalAvaliacao = ({ isOpen, onClose }) => {
  // Se isOpen for falso, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw]  mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
        <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Avaliando Alunos Selecionados</h2>
        <hr className="border-none bg-gray-300 h-[1px] mx-20]"/>
        
        <form className="mx-20">
          <div className="flex flex-col mt-[10px] mb-[5px]"
          >
            <label>Justificativa (Somente Alunos Retidos):</label>
            <input type="text" className="p-1 mt-2 py-4 rounded-[18px] border border-black" />
          </div>

          <div className="flex flex-col mt-[30px] mb-[5px]">
            <label>Informações Complementares:</label>
            <input type="text" className="p-1 mt-2 py-4 rounded-[18px] border border-black" />
          </div>

          <div className="flex flex-col mt-[30px] mb-[5px]">
            <label>Ação Proposta (Para Apreciação do Conselho Final):</label>
            <input type="text" className="p-1 mt-2 py-4 rounded-[18px] border border-black" />
          </div>

          <div className="flex flex-col mt-[30px] mb-[5px]">
            <label>Responsável(*):</label>
            <select className="p-1 mt-[5px] py-4 rounded-[18px] border border-black">
              <option>Assistente da Qualidade de Vida</option>
              <option>Outro...</option>
            </select>
            <label className="text-gray-500">(*) Todos os Docentes se for trabalho Conjunto.</label>
          </div>

          <div className="flex flex-col mt-[30px] mb-[5px]">
            <label className="font-bold">Natureza da Ocorrência:</label>
            <div className="flex justify-center items-center gap-[75px] mt-[30px]">
              <label><input type="checkbox" /> Comportamental</label>
              <label className="ml-[10px] "><input type="checkbox" /> Aproveitamento Escolar</label>
              <label className="ml-[10px] "><input type="checkbox" /> Frequência</label>
              <label className="ml-[10px] "><input type="checkbox" /> Outro: <input type="text" className="border border-[#ccc]" /></label>
            </div>
          </div>

          <hr className="border-none bg-gray-300 h-[2px] py-[1px]"/>
          
          <div className="flex justify-center items-end gap-[50px] mt-[30px]">
            {/* O botão Cancelar chama a função onClose que vem das props */}
            <button type="button" onClick={onClose} className="py-2 px-[120px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-[120px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer trasition-all duration-200 active:scale-95">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAvaliacao;