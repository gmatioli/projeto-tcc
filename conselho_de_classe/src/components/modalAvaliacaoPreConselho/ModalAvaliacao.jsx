import { useEffect, useState } from 'react';

const API = 'http://localhost:3001/api/conselho';

const RESPONSAVEIS = [
  { value: 'aqv_coordenacao_docente', label: 'AQV, coordenação e docente' },
  { value: 'aqv_coordenacao',         label: 'AQV e coordenação' },
  { value: 'docente_aqv',             label: 'Docente e AQV' },
  { value: 'docente_uc',              label: 'Docente da U.C' },
  { value: 'analista_qualidade_vida', label: 'Analista e Qualidade de Vida' }
];

const NATUREZAS = ['Comportamental', 'Aproveitamento Escolar', 'Frequência'];

const ModalAvaliacao = ({
  isOpen,
  onClose,
  conselhoId,
  idUsuario,
  alunosSelecionados = [],
  onSaved,
  onRemoved
}) => {
  const unicoComAvaliacao =
    alunosSelecionados.length === 1 && alunosSelecionados[0].avaliacaoExistente;
  const mode = unicoComAvaliacao ? 'edit' : 'create';
  const avalExist = unicoComAvaliacao ? alunosSelecionados[0].avaliacaoExistente : null;

  const [tipoAvaliacao, setTipoAvaliacao] = useState('retido');
  const [form, setForm] = useState({
    justificativa: '',
    acaoProposta: '',
    informacoesComplementares: '',
    responsavel: '',
    naturezaOcorrencia: [],
    naturezaOcorrenciaOutro: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (avalExist) {
      const natOcor = Array.isArray(avalExist.naturezaOcorrencia)
        ? avalExist.naturezaOcorrencia
        : [];
      const padroes = natOcor.filter(n => NATUREZAS.includes(n));
      const outro = natOcor.find(n => !NATUREZAS.includes(n)) || '';
      setTipoAvaliacao(avalExist.justificativa ? 'retido' : avalExist.acaoProposta ? 'sugestao' : 'retido');
      setForm({
        justificativa: avalExist.justificativa || '',
        acaoProposta: avalExist.acaoProposta || '',
        informacoesComplementares: avalExist.informacoesComplementares || '',
        responsavel: avalExist.responsavel || '',
        naturezaOcorrencia: padroes,
        naturezaOcorrenciaOutro: outro
      });
    } else {
      setTipoAvaliacao('retido');
      setForm({
        justificativa: '',
        acaoProposta: '',
        informacoesComplementares: '',
        responsavel: '',
        naturezaOcorrencia: [],
        naturezaOcorrenciaOutro: ''
      });
    }
  }, [isOpen, avalExist]);

  if (!isOpen) return null;

  const toggleNatureza = (n) => {
    setForm(f => ({
      ...f,
      naturezaOcorrencia: f.naturezaOcorrencia.includes(n)
        ? f.naturezaOcorrencia.filter(x => x !== n)
        : [...f.naturezaOcorrencia, n]
    }));
  };

  const naturezasParaEnviar = () => {
    const arr = [...form.naturezaOcorrencia];
    const outro = form.naturezaOcorrenciaOutro.trim();
    if (outro) arr.push(outro);
    return arr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conselhoId) return alert('Conselho não está ativo.');
    if (!form.responsavel) return alert('Selecione o responsável.');
    if (tipoAvaliacao === 'retido' && !form.justificativa.trim()) {
      return alert('Preencha a justificativa para o aluno retido.');
    }
    if (tipoAvaliacao === 'sugestao' && !form.acaoProposta.trim()) {
      return alert('Preencha a ação proposta.');
    }

    setSalvando(true);
    try {
      const natureza = naturezasParaEnviar();
      const payload = {
        conselhoId,
        idUsuario,
        naturezaOcorrencia: natureza.length ? natureza : null,
        restricao: null,
        justificativa: tipoAvaliacao === 'retido' ? form.justificativa.trim() : null,
        acaoProposta: tipoAvaliacao === 'sugestao' ? form.acaoProposta.trim() : null,
        informacoesComplementares: form.informacoesComplementares.trim() || null,
        responsavel: form.responsavel,
        situacaoFinal: null,
        contestacaoSituacaoFinal: null
      };

      const resultados = await Promise.all(
        alunosSelecionados.map(a =>
          fetch(`${API}/avaliacao-aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, idAluno: a.id })
          }).then(r => r.json())
        )
      );

      const falhou = resultados.find(r => !r.sucesso);
      if (falhou) {
        alert(falhou.mensagem || 'Erro ao salvar avaliação.');
        return;
      }
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliação.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemove = async () => {
    if (mode !== 'edit') return;
    if (!confirm('Remover restrição deste aluno? Esta ação não pode ser desfeita.')) return;
    setRemovendo(true);
    try {
      const resp = await fetch(`${API}/avaliacao-aluno`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conselhoId, idAluno: alunosSelecionados[0].id })
      });
      const dados = await resp.json();
      if (!dados.sucesso) {
        alert(dados.mensagem || 'Erro ao remover restrição.');
        return;
      }
      onRemoved && onRemoved(alunosSelecionados[0].id);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover restrição.');
    } finally {
      setRemovendo(false);
    }
  };

  const titulo = mode === 'edit'
    ? `Editando avaliação de ${alunosSelecionados[0].nome}`
    : alunosSelecionados.length === 1
      ? `Avaliando ${alunosSelecionados[0].nome}`
      : `Avaliando ${alunosSelecionados.length} Alunos Selecionados`;

  return (
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]">
      <div className="flex flex-col bg-white p-5 rounded-[10px] ml-[18vw] text-xl mt-[8vh] w-[1200px] max-w-[90%] max-h-[85vh] overflow-y-auto">
        <h2 className="text-center mt-3 mb-[10px] text-3xl font-bold">{titulo}</h2>
        <hr className="border-none bg-gray-300 h-[1px] mx-20 py-[1px]"/>

        <form className="mx-20" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-12 mt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoAvaliacao"
                value="retido"
                checked={tipoAvaliacao === 'retido'}
                onChange={() => setTipoAvaliacao('retido')}
              />
              Aluno será retido
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoAvaliacao"
                value="sugestao"
                checked={tipoAvaliacao === 'sugestao'}
                onChange={() => setTipoAvaliacao('sugestao')}
              />
              Sugestão pro Conselho Final
            </label>
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Justificativa (Somente Alunos Retidos):</label>
            <input
              type="text"
              className={`p-1 mt-2 py-2 rounded-[18px] border border-black pl-4 ${tipoAvaliacao !== 'retido' ? 'bg-gray-100 text-gray-400' : ''}`}
              value={form.justificativa}
              onChange={e => setForm(f => ({ ...f, justificativa: e.target.value }))}
              disabled={tipoAvaliacao !== 'retido'}
            />
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Ação Proposta (Para Apreciação do Conselho Final):</label>
            <input
              type="text"
              className={`p-1 mt-2 py-2 rounded-[18px] border border-black pl-4 ${tipoAvaliacao !== 'sugestao' ? 'bg-gray-100 text-gray-400' : ''}`}
              value={form.acaoProposta}
              onChange={e => setForm(f => ({ ...f, acaoProposta: e.target.value }))}
              disabled={tipoAvaliacao !== 'sugestao'}
            />
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Informações Complementares:</label>
            <input
              type="text"
              className="p-1 mt-2 py-2 rounded-[18px] border border-black pl-4"
              value={form.informacoesComplementares}
              onChange={e => setForm(f => ({ ...f, informacoesComplementares: e.target.value }))}
            />
          </div>

          <div className="flex flex-col mt-[15px] mb-[10px]">
            <label>Responsável(*):</label>
            <select
              className="p-1 mt-[5px] py-2 rounded-[18px] border border-black"
              value={form.responsavel}
              onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}
              required
            >
              <option value="" disabled hidden>Selecione</option>
              {RESPONSAVEIS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label className="text-gray-500">(*) Todos os Docentes se for trabalho Conjunto.</label>
          </div>

          <div className="flex flex-col mt-[30px] mb-[5px]">
            <label className="text-2xl font-bold">Natureza da Ocorrência:</label>
            <div className="flex flex-wrap justify-center items-center gap-[25px] mt-[20px]">
              {NATUREZAS.map(n => (
                <label key={n} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.naturezaOcorrencia.includes(n)}
                    onChange={() => toggleNatureza(n)}
                  /> {n}
                </label>
              ))}
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!form.naturezaOcorrenciaOutro}
                  onChange={e => !e.target.checked && setForm(f => ({ ...f, naturezaOcorrenciaOutro: '' }))}
                /> Outro:
                <input
                  type="text"
                  className="border border-[#ccc] ml-1"
                  value={form.naturezaOcorrenciaOutro}
                  onChange={e => setForm(f => ({ ...f, naturezaOcorrenciaOutro: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <hr className="border-none bg-gray-300 mt-8 h-[2px] py-[1px]"/>

          <div className="flex justify-center items-end gap-[30px] mt-8 mb-4 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando || removendo}
              className="py-2 px-[60px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={salvando || removendo}
                className="py-2 px-[60px] rounded-[50px] text-xl border border-black bg-gray-700 text-white shadow-[0_0_3px_gray] cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {removendo ? 'Removendo...' : 'Remover Restrição'}
              </button>
            )}
            <button
              type="submit"
              disabled={salvando || removendo}
              className="py-2 px-[60px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : mode === 'edit' ? 'Atualizar Informações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAvaliacao;
