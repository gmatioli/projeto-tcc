const ModalAvaliacaoTurma = ({ isOpen, onClose }) => {
  // Se isOpen for falso, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
        <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Posição do Conselho, com relação a Turma: </h2>
        <hr className="border-none bg-gray-300 h-[1px] mx-20] py-[1px]"/>
        
        <form className="mx-20">
          <div className="flex justify-between mt-8">
            <label>1. Organização:</label>
            <div className="flex gap-3">
              <input type="radio" id="" />
              <label>Atende satisfatoriamente</label>

              <input type="radio" id="" />
              <label>Necessita de orientação</label>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <label>2. Comportamental:</label>
            <div className="flex gap-3">
              <input type="radio" id="" />
              <label>Atende satisfatoriamente</label>

              <input type="radio" id="" />
              <label>Necessita de orientação</label>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <label>3. Assiduidade:</label>
            <div className="flex gap-3">
              <input type="radio" id="" />
              <label>Atende satisfatoriamente</label>

              <input type="radio" id="" />
              <label>Necessita de orientação</label>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <label>4. Disponibilidade para aprendizagem:</label>
            <div className="flex gap-3">
              <input type="radio" id="" />
              <label>Atende satisfatoriamente</label>

              <input type="radio" id="" />
              <label>Necessita de orientação</label>
            </div>
          </div>

          <div className="flex flex-col mt-8">
            <label>Outros - Citar:</label>
            <input type="text" className="text-l py-3 mt-[5px] rounded-[18px] border border-[#bbb] px-4" />
          </div>

          <div>
            <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">De modo geral, os alunos matriculados na turma:</h2>
            <div className="flex flex-col gap-6 mt-6">
                <div className="flex gap-3">
                  <input type="radio" id=""/>
                  <label>Alcançam os objetivos educacionais propostos, não necessitando de ações preventivas.</label>
                </div>
                <div className="flex gap-3">
                  <input type="radio" id="" />
                  <label>Não alcançam os objetivos educacionais propostos, devendo ser adotada a seguinte ação preventiva.</label>
                </div>
              </div>
              <input type="text" className="text-l py-3 mt-4 w-full rounded-[18px] border border-[#bbb] px-4" />
          </div>

          <hr className="border-none bg-gray-300 h-[2px] py-[1px] mt-8"/>
          
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

export default ModalAvaliacaoTurma;
