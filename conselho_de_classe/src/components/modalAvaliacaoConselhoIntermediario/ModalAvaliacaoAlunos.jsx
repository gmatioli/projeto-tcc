const ModalAvaliacaoAlunos = ({ isOpen, onClose }) => {
  // Se isOpen for falso, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
        <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Avaliando Alunos Selecionados</h2>
        <hr />
        
        <form className="mx-20">
          <div className="flex flex-col mt-[50px] mb-[15px]"
          >
            <label>Restrição:</label>
            <input type="text" placeholder="Ex: Faltas Injustificadas..." className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]" />
          </div>

          <div className="flex flex-col mt-[50px] mb-[15px]">
            <label>Ação Proposta:</label>
            <input type="text" placeholder="Ex: Solicitar comparecimento..." className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]" />
          </div>

          <div className="flex flex-col mt-[50px] mb-[15px]">
            <label>Responsável(*):</label>
            <select className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]">
              <option>Assistente da Qualidade de Vida</option>
              <option>Outro...</option>
            </select>
          </div>

          <div className="flex flex-col mt-[50px] mb-[15px]">
            <label>Natureza da Ocorrência:</label>
            <div className="flex justify-center items-center gap-[75px] mt-[25px]">
              <label><input type="checkbox" /> Comportamental</label>
              <label className="ml-[10px] "><input type="checkbox" /> Aproveitamento Escolar</label>
              <label className="ml-[10px] "><input type="checkbox" /> Frequência</label>
              <label className="ml-[10px] "><input type="checkbox" /> Outro: <input type="text" className="border border-[#bbb]" /></label>
            </div>
          </div>

          <hr className="border-none bg-gray-300 h-[2px] py-[1px] mt-12"/>
          
          <div className="flex justify-center items-end gap-[50px] mt-[30px]">
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

export default ModalAvaliacaoAlunos;
