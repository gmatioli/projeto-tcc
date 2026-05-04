const ModalJustificativa = ({ isOpen, onClose }) => {
    // Se isOpen for falso, não renderiza nada
    if (!isOpen) return null;
  
    const aluno = "Maria Alves da Silva"

    return (
      // Fundo escuro do modal
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
        {/* Caixa branca do formulário */}
        <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
          <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Justificativa </h2>
          <hr className="border-none bg-gray-300 h-[1px] mx-20] py-[1px]"/>
          
          <form className="flex flex-col gap-12 mx-20 ">
            
          <label className="mt-8 text-3xl">{`Aluno(a): ${aluno}`}</label>
          <textarea className="w-full h-[35vh] border border-black rounded-[20px]" id="text_area"></textarea>
            
  
            
            <div className="flex justify-center items-end gap-[50px] mt-[30px]">
              <button type="button" onClick={onClose} className="py-4 px-[180px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
                Cancelar
              </button>
              <button type="submit" className="py-4 px-[180px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer trasition-all duration-200 active:scale-95">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default ModalJustificativa;
  