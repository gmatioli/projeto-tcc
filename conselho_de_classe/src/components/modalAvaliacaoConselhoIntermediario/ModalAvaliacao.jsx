const ModalAvaliacao = ({ isOpen, onClose }) => {
  // Se isOpen for falso, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
        <h2 className="text-center mt-5 mb-[10px]">Avaliando Alunos Selecionados</h2>
        <hr />
        
        <form>
          <div className="flex flex-col mt-[50px] mb-[15px]"
          >
            <label>Restrição:</label>
            <input type="text" placeholder="Ex: Faltas Injustificadas..." className="p-1 mt-[5px] rounded-[4px] border border-[#ccc]" />
          </div>

          <div className="flex flex-col mt-[50px] mb-[15px]">
            <label>Ação Proposta:</label>
            <input type="text" placeholder="Ex: Solicitar comparecimento..." className="p-1 mt-[5px] rounded-[4px] border border-[#ccc]" />
          </div>

          <div className="flex flex-col mt-[50px] mb-[15px]">
            <label>Responsável(*):</label>
            <select className="p-1 mt-[5px] rounded-[4px] border border-[#ccc]">
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
              <label className="ml-[10px] "><input type="checkbox" /> Outro: <input type="text" className="border border-[#ccc]" /></label>
            </div>
          </div>

          <hr style={{marginTop: '100px'}}/>
          
          <div className="flex justify-center items-end gap-[50px] mt-[20px]">
            {/* O botão Cancelar chama a função onClose que vem das props */}
            <button type="button" onClick={onClose} className="py-5 px-[120px] rounded-[50px] border border-[#ccc] cursor-pointer">
              Cancelar
            </button>
            <button type="submit" className="py-5 px-[120px] rounded-[50px] border-none bg-[#E53935] text-white cursor-pointer">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAvaliacao;
