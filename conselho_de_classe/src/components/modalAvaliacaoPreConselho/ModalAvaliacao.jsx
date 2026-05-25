import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { API, authFetch } from '../../config/api';

const NATUREZAS = ['Comportamental', 'Aproveitamento Escolar', 'Frequência'];

const initialState = {
  naturezas: [],
  naturezaOutro: '',
  justificativa: '',
  informacoesComplementares: '',
  acaoProposta: '',
  responsavel: '',
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
  const [removendo, setRemovendo] = useState(false);


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
          justificativa:    av.justificativa                || '',
          acaoProposta: av.acaoProposta || '',
          responsavel:  av.responsavel || '',
        });
      } else {
        setForm(initialState);
      }
    }, [isOpen]);

  const alunoUnicoComAvaliacao = alunosSelecionados.length === 1 && alunosSelecionados[0].avaliacaoExistente;

  if (!isOpen || alunosSelecionados.length === 0) return null;

  // Alunos selecionados que JÁ possuem avaliação no Conselho Intermediário
  // do mesmo ciclo. Usado para mostrar contexto e pré-preencher restrição.
  const comHistorico = (alunosSelecionados || []).filter(a => a.historicoIntermediario);
  const historicoUnico = comHistorico.length === 1 ? comHistorico[0].historicoIntermediario : null;

  // Reconhece quando escreve em um dos campos
  const justificativaPreenchida = form.justificativa.trim().length > 0;
  const acaoPropostaPreenchida  = form.acaoProposta.trim().length > 0;

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

  const validarForm = () => {
    const erros = [];

    if (!form.acaoProposta.trim() && !form.justificativa.trim())  erros.push('Ação Proposta');
    if (!form.responsavel)          erros.push('Responsável');

    // Natureza: aceita check OU texto livre em "Outro"
    const temNatureza = form.naturezas.length > 0 || form.naturezaOutro.trim();
    if (!temNatureza) erros.push('Natureza da Ocorrência');

    return erros;
  };

  const handleSalvarTodos = async () => {
    const erros = validarForm();

    if(erros.length > 0) {
      toast.error('Preencha os campos obrigatórios: ' + erros.join(', '));
      return; 
    }

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
      responsavel: form.responsavel,
      idUsuario
    };

    try {
      const respostas = await Promise.all(
        alunosSelecionados.map(aluno =>
          authFetch(`${API.conselho}/avaliacao-aluno`, {
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
      if (form.justificativa.trim() && form.acaoProposta.trim()) {
        alert('Preencha apenas Justificativa OU Ação Proposta, não os dois.');
        return;
      }

      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliações: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

     // =====================================================================
  // REMOVER RESTRIÇÃO POR ALUNO INDIVIDUAL
  // =====================================================================
  const handleRemoverRestricao = async () => {
    if (!alunoUnicoComAvaliacao) return
    const idAluno = alunosSelecionados[0].id;    

    setRemovendo(true);
    try {
      const resp = await authFetch(`${API.conselho}/avaliacao-aluno/${conselhoId}/${idAluno}`, 
      { method: 'DELETE' }
      ).then(r => r.json());

      if (!resp.sucesso) {
        throw new Error(resp.mensagem || 'Erro desconhecido');
      }
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover restrição: ' + err.message);
    } finally {
      setRemovendo(false);
    }

  }

    
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
              // className="px-2 py-1  text-black-800 rounded-full text-sm border border-gray-800">
              // {a.nome}
              className={`px-2 py-1 rounded-full text-sm border ${a.historicoIntermediario ? 'border-yellow-600 text-yellow-800 bg-yellow-50' : 'border-gray-800 text-black-800'}`}
              title={a.historicoIntermediario ? 'Restrito no Conselho Intermediário deste ciclo' : ''}>
              {a.nome}{a.historicoIntermediario ? ' *' : ''}
            </span>
            
          ))}
        </div>
        <hr className="border-none bg-gray-300 h-[1px] mx-20 py-[1px]"/>
        
{/* QUALQUER COISA COMENTAR */}
        {comHistorico.length > 0 && (
          <div className="mx-20 mt-3 p-3 rounded-md border border-yellow-500 bg-yellow-50 text-sm">
            <p className="font-bold text-yellow-800">
              Histórico do Conselho Intermediário (mesmo ciclo):
            </p>
            {historicoUnico ? (
              <ul className="mt-1 list-disc list-inside text-yellow-900">
                {historicoUnico.restricao && (<li><strong>Restrição:</strong> {historicoUnico.restricao}</li>)}
                {historicoUnico.acaoProposta && (<li><strong>Ação Proposta:</strong> {historicoUnico.acaoProposta}</li>)}
                {historicoUnico.responsavel && (<li><strong>Responsável:</strong> {historicoUnico.responsavel}</li>)}
                {Array.isArray(historicoUnico.naturezaOcorrencia) && historicoUnico.naturezaOcorrencia.length > 0 && (
                  <li><strong>Natureza:</strong> {historicoUnico.naturezaOcorrencia.join(', ')}</li>
                )}
              </ul>
            ) : (
              <p className="text-yellow-900 mt-1">
                {comHistorico.length} aluno(s) com restrição no Intermediário — selecione individualmente para ver os dados.
              </p>
            )}
          </div>
        )}

        <div className="mx-20 overflow-y-auto flex-1">
       
          <div className="flex flex-col mt-[15px] mb-[10px]"
          >
            <label>Justificativa (Somente Alunos Retidos):</label>
            <input
            type="text"
            value={form.justificativa}
            disabled={acaoPropostaPreenchida}
            onChange={e => setCampo('justificativa', e.target.value)}
            className={`p-1 mt-2 py-2 rounded-[18px] border border-black pl-4
            ${acaoPropostaPreenchida ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
            />
            {acaoPropostaPreenchida && (
              <span className="text-sm text-gray-500 mt-1">
                Limpe a "Ação Proposta" para preencher a justificativa.
              </span>
            )}
                  
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Ação Proposta (Para Apreciação do Conselho Final):</label>
            <input
              type="text"
              value={form.acaoProposta}
              disabled={justificativaPreenchida}
              onChange={e => setCampo('acaoProposta', e.target.value)}
              className={`p-1 mt-2 py-2 rounded-[18px] border border-black pl-4
              ${justificativaPreenchida ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
              />
              {justificativaPreenchida && (
                <span className="text-sm text-gray-500 mt-1">
                  Limpe a "Justificativa" para preencher a ação proposta.
                </span>
              )}
          </div>
          {/* <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Informações Complementares:</label>
            <input
              type="text"
              value={form.informacoesComplementares}
              onChange={e => setCampo('informacoesComplementares', e.target.value)}
              className="p-1 mt-2 py-2 rounded-[18px] border border-black pl-4" />
          </div> */}

        

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Responsável(*):</label>
            <select
              value={form.responsavel}
              onChange={e => setCampo('responsavel', e.target.value)}
              className="p-1 mt-[5px] py-2 rounded-[18px] border border-black">
              <option value="" hidden  >Selecione</option>
              <option value="Docente">Docente</option>
              <option value="OPP">Orientador Práticas Profissionais</option>
              <option value="Coordenação">Coordenação</option>
              <option value="AQV">Analista e Qualidade de Vida</option>
              <option value="Trabalho Conjunto">Trabalho em Conjunto</option>
            </select>
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
            <button type="button" onClick={onClose} disabled={salvando || removendo} className="py-2 px-[120px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer trasition-all duration-200 active:scale-95">
              Cancelar
            </button>

            {alunoUnicoComAvaliacao && (
              <button type="button"
              onClick={handleRemoverRestricao}
              disabled={salvando || removendo}
              className="py-2 px-[40px] rounded-[50px] text-xl border-2 border-red-700 text-red-700 bg-white shadow-[0_0_3px_gray] cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 hover:bg-red-50">
              {removendo ? 'Removendo...' : 'Remover Restrição'}

              </button>
            )}


             <button 
            type="button" 
            onClick={handleSalvarTodos}
            disabled={salvando || removendo}
            className="py-2 px-[80px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50">
            {salvando
              ? (alunoUnicoComAvaliacao ? 'Atualizando...' : 'Salvando...')
              : (alunoUnicoComAvaliacao ? 'Atualizar Avaliação' : 'Salvar Avaliação')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAvaliacao;