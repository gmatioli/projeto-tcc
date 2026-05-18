import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { API } from '../../config/api';

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
        restricao:    av.restricao                || '',
        acaoProposta: av.acaoProposta || '',
        responsavel:  av.responsavel  || '',
      });

    } else {
      setForm(initialState);
    }
  }, [isOpen]);

  const alunoUnicoComAvaliacao = alunosSelecionados.length === 1 && alunosSelecionados[0].avaliacaoExistente;


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

  const validarForm = () => {
    const erros = [];

    if (!form.restricao.trim())     erros.push('Restrição');
    if (!form.acaoProposta.trim())  erros.push('Ação Proposta');
    if (!form.responsavel)          erros.push('Responsável');

    // Natureza: aceita check OU texto livre em "Outro"
    const temNatureza = form.naturezas.length > 0 || form.naturezaOutro.trim();
    if (!temNatureza) erros.push('Natureza da Ocorrência');

    return erros;
};
   // =====================================================================
  // SALVAR EM LOTE: a MESMA avaliação para TODOS os alunos selecionados
  // =====================================================================
  const handleSalvarTodos = async () => {
    const erros = validarForm();

    if(erros.length > 0) {
      toast.error('Preencha os campos obrigatórios: ' + erros.join(', '));
      return; 
    }

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
      acaoProposta: form.acaoProposta,
      responsavel: form.responsavel,
      idUsuario
    };

    try {
      // Dispara TODAS as requisições em paralelo com Promise.all
      // (mais rápido do que esperar uma por uma como era antes).
      // Se alguma falhar, Promise.all rejeita e cai no catch.
      const respostas = await Promise.all(
        alunosSelecionados.map(aluno =>
          fetch(`${API.conselho}/avaliacao-aluno`, {
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

   // =====================================================================
  // REMOVER RESTRIÇÃO POR ALUNO INDIVIDUAL
  // =====================================================================
  const handleRemoverRestricao = async () => {
    if (!alunoUnicoComAvaliacao) return
    const idAluno = alunosSelecionados[0].id;    

    setRemovendo(true);
    try {
      const resp = await fetch(`${API.conselho}/avaliacao-aluno/${conselhoId}/${idAluno}`, 
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" >
      
      {/* Caixa branca do formulário */}
      <div className="flex flex-col bg-white text-xl ml-[18vw] mt-[8vh] rounded-[10px] w-full max-w-[70vw] max-h-[90vh] shadow-xl overflow-hidden">
        
        <div className="shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-center text-2xl sm:text-3xl font-bold mb-4">Avaliando Alunos Selecionados</h2>
          
          <div className="flex flex-wrap items-center gap-2 max-h-[80px] overflow-y-auto">
            <span className="text-gray-500 font-medium text-base sm:text-lg">
              Aluno(s):
            </span>
            {alunosSelecionados.map(a => (
              <span
                key={a.id}
                className="px-3 py-1 text-gray-800 rounded-full text-sm sm:text-base border border-gray-800 whitespace-nowrap">
                {a.nome}
              </span>
            ))}
          </div>
        </div>
        
         <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          <div className="flex flex-col mb-6">
            <label className="text-xl sm:text-2xl font-medium mb-2">Restrição:</label>
            <input 
              type="text" 
              placeholder="Ex: Faltas Injustificadas..." 
              value={form.restricao}
              onChange={e => setCampo('restricao', e.target.value)}
              className="text-base sm:text-lg w-full px-4 py-3 rounded-[18px] border border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="text-xl sm:text-2xl font-medium mb-2">Ação Proposta:</label>
            <input 
              type="text"
              placeholder="Ex: Solicitar comparecimento..." 
              value={form.acaoProposta}
              onChange={e => setCampo('acaoProposta', e.target.value)}
              className="text-base sm:text-lg w-full px-4 py-3 rounded-[18px] border border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="text-xl sm:text-2xl font-medium mb-2">Responsável(*):</label>
            <select 
              value={form.responsavel}
              onChange={e => setCampo('responsavel', e.target.value)}
              className="text-base sm:text-lg w-full px-4 py-3 rounded-[18px] border border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer bg-white">
              <option value="" hidden  >Selecione</option>
              <option value="Docente">Docente</option>
              <option value="OPP">Orientador Práticas Profissionais</option>
              <option value="Coordenação">Coordenação</option>
              <option value="AQV">Analista e Qualidade de Vida</option>
              <option value="Trabalho Conjunto">Trabalho em Conjunto</option>
            </select>
          </div>

          {/* NATUREZA DA OCORRENCIA */}
          <div className="flex flex-col mt-8 mb-4 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
            <label className="text-xl sm:text-2xl font-bold mb-4">Natureza da Ocorrência:</label>
            
            <div className="flex flex-wrap justify-between items-center gap-4 sm:gap-6">
               {NATUREZAS.map(n => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.naturezas.includes(n)}
                    onChange={() => toggleNatureza(n)}
                    className="w-4 h-4 cursor-pointer"
                  /> 
                  <span className="text-base sm:text-lg">{n}</span>
                </label>
              ))}
              
              <label className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="text-base sm:text-lg font-medium">Outro:</span>
                <input
                  type="text"
                  value={form.naturezaOutro}
                  onChange={e => setCampo('naturezaOutro', e.target.value)}
                  className="w-full sm:w-64 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-[10px]">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            
            <button 
              type="button" 
              onClick={onClose} 
              disabled={salvando || removendo}
              className="w-full sm:w-auto py-3 px-8 rounded-full text-lg border-2 border-gray-800 text-gray-800 hover:bg-gray-200 transition-all duration-200 active:scale-95 disabled:opacity-50 font-semibold">
              Cancelar
            </button>

            {alunoUnicoComAvaliacao && (
              <button 
                type="button"
                onClick={handleRemoverRestricao}
                disabled={salvando || removendo}
                className="w-full sm:w-auto py-3 px-8 rounded-full text-lg border-2 border-red-700 text-red-700 bg-white hover:bg-red-50 transition-all duration-200 active:scale-95 disabled:opacity-50 font-semibold">
                {removendo ? 'Removendo...' : 'Remover Restrição'}
              </button>
            )}

            <button 
              type="submit" 
              onClick={handleSalvarTodos}
              disabled={salvando || removendo}
              className="w-full sm:w-auto py-3 px-8 rounded-full text-lg border-2 border-transparent bg-[#E53935] text-white hover:bg-red-700 transition-all duration-200 active:scale-95 disabled:opacity-50 font-semibold">
              {salvando
                ? (alunoUnicoComAvaliacao ? 'Atualizando...' : 'Salvando...')
                : (alunoUnicoComAvaliacao ? 'Atualizar Avaliação' : 'Salvar Avaliação')}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAvaliacaoAlunos;
