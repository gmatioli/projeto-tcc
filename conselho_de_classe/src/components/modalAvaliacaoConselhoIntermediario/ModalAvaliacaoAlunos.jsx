import { useEffect, useState } from "react";

const API =  'http://localhost:3001/api/conselho';

const NATUREZAS = ['Comportamental', 'Aproveitamento Escolar', 'Frequência'];

const initialState = {
  naturezas: [],        // array de strings selecionadas nos checkboxes
  naturezaOutro: '',    // texto livre quando "Outro" é marcado
  restricao: '',
  acaoProposta: '',
  responsavel: '',
};

const ModalAvaliacaoAlunos = ({ 
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
    // Pré-preenche apenas quando UM único aluno com avaliação existente é selecionado.
    // Para múltiplos alunos, o formulário começa vazio (avaliação em lote).
    const unico = alunosSelecionados.length === 1 ? alunosSelecionados[0] : null;
    const av = unico?.avaliacaoExistente;

    if (av) {
      const naturezasBruto = Array.isArray(av.naturezaOcorrencia) ? av.naturezaOcorrencia : [];
      const naturezasMarcadas = naturezasBruto.filter(n => NATUREZAS.includes(n));
      const naturezaOutro = naturezasBruto.find(n => !NATUREZAS.includes(n)) || '';
      setForm({
        naturezas: naturezasMarcadas,
        naturezaOutro,
        restricao:    av.restricao                || '',
        acaoProposta: av.acaoPropostaIntermediario || '',
        responsavel:  av.responsavelIntermediario  || '',
      });
    } else {
      setForm(initialState);
    }
  }, [isOpen]);

  if (!isOpen || alunosSelecionados.length === 0) return null;

  const setCampo = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  // Marca/desmarca um checkbox de natureza
  const toggleNatureza = (n) => {
    setForm(prev => {
      const novaLista = prev.naturezas.includes(n)
        ? prev.naturezas.filter(x => x !== n)
        : [...prev.naturezas, n];
      return { ...prev, naturezas: novaLista };
    });
  };

   // =====================================================================
  // SALVAR EM LOTE: a MESMA avaliação para TODOS os alunos selecionados
  // =====================================================================
  const handleSalvarTodos = async () => {
    setSalvando(true);

    // Junta as naturezas marcadas (checkboxes) com o texto livre (Outro)
    // em uma única string separada por vírgulas (formato do banco)
    const naturezasFinais = [
      ...form.naturezas,
      ...(form.naturezaOutro ? [form.naturezaOutro] : [])
    ];

    // Monta o "payload" base, que é o mesmo para todos os alunos.
    // Só o idAluno muda dentro do loop.
    const payloadBase = {
      conselhoId,
      naturezaOcorrencia: naturezasFinais,
      restricao: form.restricao,
      acaoPropostaIntermediario: form.acaoProposta,
      responsavelIntermediario: form.responsavel,
      idUsuario
    };

    try {
      // Dispara TODAS as requisições em paralelo com Promise.all
      // (mais rápido do que esperar uma por uma como era antes).
      // Se alguma falhar, Promise.all rejeita e cai no catch.
      const respostas = await Promise.all(
        alunosSelecionados.map(aluno =>
          fetch(`${API}/avaliacao-aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payloadBase, idAluno: aluno.id })
          }).then(r => r.json())
        )
      );

      // Verifica se alguma resposta veio com sucesso=false
      const falhas = respostas.filter(r => !r.sucesso);
      if (falhas.length > 0) {
        throw new Error(
          `${falhas.length} avaliações não foram salvas. ${falhas[0].mensagem || ''}`
        );
      }

      // Tudo deu certo: avisa o componente pai (vai fechar modal + recarregar dados)
      onSaved && onSaved();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliações: ' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white p-5 text-xl rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px]">
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
        
        <div className="mx-20  overflow-y-auto flex-1">

          <div className="flex flex-col mt-[20px] mb-[15px]"
          >
            <label className="text-2xl">Restrição:</label>
            <input 
            type="text" 
            placeholder="Ex: Faltas Injustificadas..." 
            value={form.restricao}
            onChange={e => setCampo('restricao', e.target.value)}
            className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]" />
          </div>

          <div className="flex flex-col mt-[20px] mb-[15px]">
            <label className="text-2xl">Ação Proposta:</label>
            <input 
            type="text"
            placeholder="Ex: Solicitar comparecimento..." 
            value={form.acaoProposta}
            onChange={e => setCampo('acaoProposta', e.target.value)}
            className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]" />
          </div>

          <div className="flex flex-col mt-[20px] mb-[15px]">
            <label className="text-2xl">Responsável(*):</label>
            <select 
              value={form.responsavel}
              onChange={e => setCampo('responsavel', e.target.value)}
              className="p-1 py-4 mt-[5px] rounded-[18px] border border-[#bbb]">
              <option value="" disabled hidden >Selecione</option>
              <option value="aqv_coordenacao_docente">AQV, coordenação e docente</option>
              <option value="aqv_coordenacao">AQV e coordenação</option>
              <option value="docente_aqv">Docente e AQV</option>
              <option value="docente_uc">Docente da U.C</option>
              <option value="analista_qualidade_vida">Analista e Qualidade de Vida</option>
            </select>
          </div>

          <div className="flex flex-col text-xl mt-[80px] mb-[15px]">
            <label className="text-2xl font-bold">Natureza da Ocorrência:</label>
            <div className="flex justify-center items-center gap-[25px] mt-[25px]">
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
                  className="border border-[#bbb] ml-2 px-2 py-1"
                />
              </label>
            </div>
          </div>
        </div>

          <hr className="border-none bg-gray-300 h-[1px] mt-[50px] py-[1px]"/>
          
          <div className="flex justify-center items-end gap-[50px] mt-[50px]">
            <button 
            type="button" 
            onClick={onClose} 
            disabled={salvando}
            className="py-2 px-[120px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
              Cancelar
            </button>
            <button 
            type="submit" 
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
  );
}

export default ModalAvaliacaoAlunos;
