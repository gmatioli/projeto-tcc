
import { useEffect, useState } from 'react';
import { API } from '../../config/api';
import { toast } from 'sonner';


const CRITERIOS = ['Atende satisfatoriamente', 'Necessita de orientação'];

const initialState = {
  organizacao: '',
  comportamental: '',
  assiduidade: '',
  disponibilidade_Aprendizado: '',
  observacao: '',
  alcancou_Objetivos: '',
  acaoPreventiva: ''
};

const ModalAvaliacaoTurma = ({
  isOpen,
  onClose,
  conselhoId,
  idTurma,
  idUsuario,
  nomeTurma,
  avaliacaoExistente,
  onSaved
}) => {

  const [form, setForm] = useState(initialState);
  const [salvando, setSalvando] = useState(false);

  const validarForm = () => {
    const erros = [];

    if (!form.organizacao)                  erros.push('Organização');
    if (!form.comportamental)               erros.push('Comportamental');
    if (!form.assiduidade)                  erros.push('Assiduidade');
    if (!form.disponibilidade_Aprendizado)  erros.push('Disponibilidade para aprendizagem');
    if (!form.alcancou_Objetivos)           erros.push('Posição geral da turma');
     // só obrigatória quando a turma NÃO alcançou os objetivos
    if (form.alcancou_Objetivos === 'Não' && !form.acaoPreventiva.trim()) {
      erros.push('Ação preventiva');
    }
    return erros;
  };

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
        acaoPreventiva:              avaliacaoExistente.acaoPreventiva                || ''
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
    const erro = validarForm();

    if(erro.length > 0) {
      toast.error('Preencha os campos obrigatórios: ' + erro.join(', '));
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
          idUsuario,
          ...form
        })
      });
      const dados = await resp.json();
      if (!dados.sucesso) throw new Error(dados.mensagem);
      onSaved && onSaved(dados.avaliacao);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar avaliação da turma: ' + err.message);
     
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" >
      
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white text-xl ml-[18vw] mt-[8vh] p-4 sm:p-6 rounded-[10px] w-full max-w-[70vw] max-h-[90vh] shadow-xl overflow-hidden">
        
        <div className="shrink-0">
          <h2 className="text-center mt-2 mb-2 text-2xl sm:text-3xl font-bold">Posição do Conselho, com relação a Turma: {nomeTurma} </h2>
          <hr className="border-none bg-gray-300 h-[1px] my-4 mx-[3vw]"/>
        </div>
        
        <div className="overflow-y-auto pr-2 pb-4 mx-[3vw] ">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className='flex flex-col gap-6'>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <label className="mb-2 lg:mb-0 font-medium">1. Organização:</label>
                {renderRadios('organizacao')}
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <label className="mb-2 lg:mb-0 font-medium">2. Comportamental:</label>
                {renderRadios('comportamental')}
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <label className="mb-2 lg:mb-0 font-medium">3. Assiduidade:</label>
                {renderRadios('assiduidade')}
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <label className="mb-2 lg:mb-0 font-medium">4. Disponibilidade para aprendizagem:</label>
                {renderRadios('disponibilidade_Aprendizado')}
              </div>

              <div className="flex flex-col">
                <label className="font-medium">Outros - Citar:</label>
                <input
                  type="text"
                  value={form.observacao}
                  onChange={(e) => setCampo('observacao', e.target.value)}
                  className="text-base sm:text-lg py-3 mt-2 rounded-[18px] border border-[#bbb] px-4 w-full"
                />
              </div>
            </div>

            <div className='bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 mt-2'>
              <h2 className="text-center mb-4 text-xl sm:text-2xl font-bold">De modo geral, os alunos matriculados na turma:</h2>
              <div className="flex flex-col gap-4 mb-4">
                  <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="radio"
                    name="alcancou_Objetivos"
                    value="Sim"
                    checked={form.alcancou_Objetivos === 'Sim'}
                    onChange={(e) => setCampo('alcancou_Objetivos', e.target.value)}
                    className="mt-1.5"
                  />
                  <span className="text-base sm:text-lg">Alcançam os objetivos educacionais propostos, não necessitando de ações preventivas.</span>
                </label>
                
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="radio"
                    name="alcancou_Objetivos"
                    value="Não"
                    checked={form.alcancou_Objetivos === 'Não'}
                    onChange={(e) => setCampo('alcancou_Objetivos', e.target.value)}
                    className="mt-1.5"
                  />
                  <span className="text-base sm:text-lg">Não alcançam os objetivos educacionais propostos, devendo ser adotada a seguinte ação preventiva.</span>
                </label>
              </div>
              
              <input
                type="text"
                placeholder="Descreva a ação preventiva..."
                value={form.acaoPreventiva}
                onChange={(e) => setCampo('acaoPreventiva', e.target.value)}
                disabled={form.alcancou_Objetivos !== 'Não'}
                className="text-base sm:text-lg py-3 w-full rounded-[18px] border border-[#bbb] px-4 disabled:bg-gray-200"
              />
            </div>
          
            <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 mt-2">
                <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                className="w-full sm:w-auto py-3 px-12 rounded-[50px] text-lg sm:text-xl border border-black shadow-[0_0_3px_gray] cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 hover:bg-gray-100">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto py-3 px-12 rounded-[50px] text-lg sm:text-xl border border-black bg-[#E53935] shadow-[0_0_3px_gray] text-white cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 hover:bg-red-700">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAvaliacaoTurma;
