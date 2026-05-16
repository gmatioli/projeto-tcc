
import { useEffect, useState } from 'react';
import { API } from '../../config/api';

const CRITERIOS = ['Atende satisfatoriamente', 'Necessita de orientação'];

const initialState = {
  organizacao: '',
  comportamental: '',
  assiduidade: '',
  disponibilidade_Aprendizado: '',
  observacao: '',
  alcancou_Objetivos: '',
  acaoProposta: ''
};

const ModalAvaliacaoTurma = ({
  isOpen,
  onClose,
  conselhoId,
  idTurma,
  nomeTurma,
  avaliacaoExistente,
  onSaved
}) => {
  const [form, setForm] = useState(initialState);
  const [salvando, setSalvando] = useState(false);

  // Pré-carrega valores quando o modal abre com avaliação já existente
  useEffect(() => {
    if (!isOpen) return;
    if (avaliacaoExistente) {
      setForm({
        organizacao:                 avaliacaoExistente.organizacao                 || '',
        comportamental:              avaliacaoExistente.comportamental              || '',
        assiduidade:                 avaliacaoExistente.assiduidade                 || '',
        disponibilidade_Aprendizado: avaliacaoExistente.disponibilidade_Aprendizado || '',
        observacao:                  avaliacaoExistente.observacao                  || '',
        alcancou_Objetivos:          avaliacaoExistente.alcancou_Objetivos          || '',
        acaoProposta:                avaliacaoExistente.acaoProposta                || ''
      });
    } else {
      setForm(initialState);
    }
  }, [isOpen, avaliacaoExistente]);

  if (!isOpen) return null;

  const setCampo = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conselhoId || !idTurma) {
      alert('Conselho ou turma não identificados.');
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch(`${API.conselho}/avaliacao-turma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conselhoId,
          idTurma,
          ...form
        })
      });
      const dados = await resp.json();
      if (!dados.sucesso) throw new Error(dados.mensagem);
      onSaved && onSaved(dados.avaliacao);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliação da turma.');
    } finally {
      setSalvando(false);
    }
  };

  const renderRadios = (campo) => (
    <div className="flex gap-3">
      {CRITERIOS.map(opcao => (
        <label key={opcao} className="flex items-center gap-2">
          <input
            type="radio"
            name={campo}
            value={opcao}
            checked={form[campo] === opcao}
            onChange={(e) => setCampo(campo, e.target.value)}
          />
          {opcao}
        </label>
      ))}
    </div>
  );


  return (
    // Fundo escuro do modal
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1000]" >
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white text-xl p-5 rounded-[10px] ml-[18vw] mt-[8vh] w-[1200px] max-w-[90%] h-[800px] ">
        <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">Posição do Conselho, com relação a Turma: {nomeTurma} </h2>
        <hr className="border-none bg-gray-300 h-[1px] mx-20 py-[1px]"/>
        
        <form className="mx-20" onSubmit={handleSubmit}>
          <div className="flex justify-between mt-8">
            <label>1. Organização:</label>
            {renderRadios('organizacao')}

          </div>

          <div className="flex justify-between mt-8">
            <label>2. Comportamental:</label>
            {renderRadios('comportamental')}

          </div>

          <div className="flex justify-between mt-8">
            <label>3. Assiduidade:</label>
            {renderRadios('assiduidade')}

          </div>

          <div className="flex justify-between mt-8">
            <label>4. Disponibilidade para aprendizagem:</label>
            {renderRadios('disponibilidade_Aprendizado')}

          </div>

          <div className="flex flex-col mt-8">
            <label>Outros - Citar:</label>
            <input
              type="text"
              value={form.observacao}
              onChange={(e) => setCampo('observacao', e.target.value)}
              className="text-l py-3 mt-[5px] rounded-[18px] border border-[#bbb] px-4"
            />
          </div>

          <div>
            <h2 className="text-center mt-5 mb-[10px] text-3xl font-bold">De modo geral, os alunos matriculados na turma:</h2>
            <div className="flex flex-col gap-6 mt-6">
                <label className="flex gap-3 items-start">
                <input
                  type="radio"
                  name="alcancou_Objetivos"
                  value="Sim"
                  checked={form.alcancou_Objetivos === 'Sim'}
                  onChange={(e) => setCampo('alcancou_Objetivos', e.target.value)}
                />
                <span>Alcançam os objetivos educacionais propostos, não necessitando de ações preventivas.</span>
              </label>
              <label className="flex gap-3 items-start">
                <input
                  type="radio"
                  name="alcancou_Objetivos"
                  value="Não"
                  checked={form.alcancou_Objetivos === 'Não'}
                  onChange={(e) => setCampo('alcancou_Objetivos', e.target.value)}
                />
                <span>Não alcançam os objetivos educacionais propostos, devendo ser adotada a seguinte ação preventiva.</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="Descreva a ação preventiva..."
              value={form.acaoProposta}
              onChange={(e) => setCampo('acaoProposta', e.target.value)}
              disabled={form.alcancou_Objetivos !== 'Não'}
              className="text-l py-3 mt-4 w-full rounded-[18px] border border-[#bbb] px-4 disabled:bg-gray-100"
            />
          </div>
          
          <div className="flex justify-center items-end gap-[50px] mt-[40px]">
              <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="py-2 px-[120px] rounded-[50px] text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="py-2 px-[120px] rounded-[50px] text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAvaliacaoTurma;
