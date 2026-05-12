import { useEffect, useState } from "react";

const API = 'http://localhost:3001/api/conselho';

const NATUREZAS = ['Comportamental', 'Aproveitamento Escolar', 'Frequência'];

const initialState = {
  naturezas: [],
  naturezaOutro: '',
  justificativa: '',
  informacoesComplementares: '',
  acaoProposta: '',
  responsavel: 'Assistente da Qualidade de Vida',
};

const ModalAvaliacao = ({
  isOpen,
  onClose,
  conselhoId,
  idUsuario,
  alunosSelecionados,
  onSaved
}) => {
  const [form, setForm] = useState(initialState);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialState);
  }, [isOpen]);

  if (!isOpen || alunosSelecionados.length === 0) return null;

  const setCampo = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const toggleNatureza = (n) => {
    setForm(prev => {
      const novaLista = prev.naturezas.includes(n)
        ? prev.naturezas.filter(x => x !== n)
        : [...prev.naturezas, n];
      return { ...prev, naturezas: novaLista };
    });
  };

  const handleSalvarTodos = async () => {
    setSalvando(true);

    const naturezasFinais = [
      ...form.naturezas,
      ...(form.naturezaOutro ? [form.naturezaOutro] : [])
    ];

    const payloadBase = {
      conselhoId,
      naturezaOcorrencia: naturezasFinais,
      justificativa: form.justificativa,
      informacoesComplementares: form.informacoesComplementares,
      acaoProposta: form.acaoProposta,
      idUsuario
    };

    try {
      const respostas = await Promise.all(
        alunosSelecionados.map(aluno =>
          fetch(`${API}/avaliacao-aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payloadBase, idAluno: aluno.id })
          }).then(r => r.json())
        )
      );

      const falhas = respostas.filter(r => !r.sucesso);
      if (falhas.length > 0) {
        throw new Error(
          `${falhas.length} avaliações não foram salvas. ${falhas[0].mensagem || ''}`
        );
      }

      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliações: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };
    
  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] text-xl mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
        <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Avaliando Alunos Selecionados</h2>

        <div className="flex flex-wrap justify-start gap-2 mb-2 mx-20 max-h-[80px] overflow-y-auto">
           <p className="text-start text-gray-500">
            Aluno(s):
          </p>
          {alunosSelecionados.map(a => (
            <span
              key={a.id}
              className="px-2 py-1  text-black-800 rounded-full text-sm border border-gray-800">
              {a.nome}
            </span>
            
          ))}
        </div>
        <hr className="border-none bg-gray-300 h-[1px] mx-20 py-[1px]"/>
        
        <div className="mx-20 overflow-y-auto flex-1">
          <div className="flex flex-col mt-[15px] mb-[10px]"
          >
            <label>Justificativa (Somente Alunos Retidos):</label>
            <input
            type="text"
            value={form.justificativa}
            onChange={e => setCampo('justificativa', e.target.value)}
            className="p-1 mt-2 py-2 rounded-[18px] border border-black pl-4" />         
            
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Informações Complementares:</label>
            <input
              type="text"
              value={form.informacoesComplementares}
              onChange={e => setCampo('informacoesComplementares', e.target.value)}
              className="p-1 mt-2 py-2 rounded-[18px] border border-black pl-4" />
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Ação Proposta (Para Apreciação do Conselho Final):</label>
            <input
              type="text"
              value={form.acaoProposta}
              onChange={e => setCampo('acaoProposta', e.target.value)}
              className="p-1 mt-2 py-2 rounded-[18px] border border-black pl-4" />
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Responsável(*):</label>
            <select
              value={form.responsavel}
              onChange={e => setCampo('responsavel', e.target.value)}
              className="p-1 mt-[5px] py-2 rounded-[18px] border border-black">
              <option>Assistente da Qualidade de Vida</option>
              <option>Outro...</option>
            </select>
            <label className="text-gray-500">(*) Todos os Docentes se for trabalho Conjunto.</label>
          </div>

          <div className="flex flex-col mt-[50px] mb-[5px]">
            <label className="text-2xl font-bold">Natureza da Ocorrência:</label>
            <div className="flex justify-center items-center gap-[25px] mt-[30px]">
              {NATUREZAS.map(n => (
                <label key={n} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.naturezas.includes(n)}
                    onChange={() => toggleNatureza(n)}
                  /> {n}
                </label>
              ))}
              <label className="flex items-center gap-2">
                Outro:
                <input
                  type="text"
                  value={form.naturezaOutro}
                  onChange={e => setCampo('naturezaOutro', e.target.value)}
                  className="border border-[#ccc] ml-2 px-2 py-1" />
              </label>
            </div>
          </div>

          <hr className="border-none bg-gray-300 mt-8 h-[2px] py-[1px]"/>
          
          <div className="flex justify-center items-end gap-[50px] mt-10">
            {/* O botão Cancelar chama a função onClose que vem das props */}
            <button type="button" onClick={onClose} disabled={salvando} className="py-2 px-[120px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
              Cancelar
            </button>
             <button 
            type="button" 
            onClick={handleSalvarTodos}
            disabled={salvando}
            className="py-2 px-[80px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50">
            {salvando
              ? 'Salvando...'
              : `Salvar`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAvaliacao;