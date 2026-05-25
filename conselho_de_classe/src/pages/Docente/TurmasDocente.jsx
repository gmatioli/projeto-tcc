import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '../../config/api';
 
// ── Modal: Ver Observações ─────────────────────────────────────────────────
import ModalObservacoes from '../../components/modalObservacao/ModalObservacao';
 
// ── Modal: Adicionar / Editar Observação ───────────────────────────────────
function ModalNovaObservacao({ isOpen, onClose, aluno, obsEditando, onSuccess }) {
  if (!isOpen) return null;
 
  const [texto, setTexto] = useState(obsEditando?.texto || '');
  const [data, setData]   = useState(obsEditando?.dataRaw  || '');
 
  const handleSalvar = async () => {
    if (!texto.trim() || !data) {
      toast.warning('Preencha a observação e a data antes de salvar.');
      return;
    }
 
    try {
      const logado = localStorage.getItem('usuarioLogado');
      if (!logado) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      
      const { email } = JSON.parse(logado); 
 
      let response;
 
      if (obsEditando && obsEditando.id) {
        response = await fetch(`${API.observacoes}/${obsEditando.id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descricao: texto,
            dataObservacao: data
          })
        });
      } else {
        const payload = {
          idAluno: aluno.id,
          emailUsuario: email, 
          descricao: texto,
          dataObservacao: data,
          categoria: 'Geral'
        };
 
        response = await fetch(`${API.observacoes}/salvar`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
 
      if (response.ok) {
        toast.success(obsEditando ? 'Observação atualizada com sucesso!' : 'Observação salva com sucesso!');
        onClose();
        if (onSuccess) onSuccess(); 
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao salvar: ${errorData.mensagem || 'Tente novamente.'}`);
      }
 
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
      toast.error('Erro de conexão com o servidor. Tente novamente.');
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-8 shadow-2xl">
 
        <h2 className="text-center text-lg font-bold mb-1">
          ALUNO: <span className="font-normal">{aluno?.nome}</span>
        </h2>
        <hr className="border-gray-300 mb-6" />
 
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">OBSERVAÇÃO:</label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
 
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">DATA DO OCORRIDO:</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
 
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={onClose}
            className="px-10 py-2 border border-gray-400 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-10 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Gráfico de Rosca simples (SVG) ────────────────────────────────────────
function GraficoRosca({ comObs, semObs }) {
  const total = comObs + semObs;
  if (total === 0) return null;
 
  const pctCom = comObs / total;
  const pctSem = semObs / total;
  const r = 50, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
 
  const dashCom = circ * pctCom;
  const gapCom = circ - dashCom;
 
  const dashSem = circ * pctSem;
  const gapSem = circ - dashSem;
  
  const offsetSem = -dashCom;
 
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-bold text-gray-700 mb-2">Gráfico de Alunos</p>
      
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="22" />
        
        <circle 
          cx={cx} cy={cy} r={r} 
          fill="none" 
          stroke="#bdd2f3ff" 
          strokeWidth="22"
          strokeDasharray={`${dashSem} ${gapSem}`}
          strokeDashoffset={offsetSem}
          transform={`rotate(-90 ${cx} ${cy})`} 
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          <title>Sem observação: {semObs} aluno(s)</title>
        </circle>
 
        <circle 
          cx={cx} cy={cy} r={r} 
          fill="none" 
          stroke="#f91616ff" 
          strokeWidth="22"
          strokeDasharray={`${dashCom} ${gapCom}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`} 
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          <title>Com observação: {comObs} aluno(s)</title>
        </circle>
      </svg>
 
      <div className="flex flex-col gap-1 mt-1 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#bdd2f3ff] inline-block"/> Sem Observação
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#f91616ff] inline-block"/> Com Observação
        </span>
      </div>
    </div>
  );
}
 
// ── Página Principal ───────────────────────────────────────────────────────
export function TurmasDocente() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
 
  const idTurma    = searchParams.get('turma');
  const nomeTurma  = searchParams.get('nomeTurma');
  const modo       = searchParams.get('modo');
 
  // ── Estado da lista de alunos ──────────────────────────────────────────
  const [alunos,     setAlunos]     = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState('');
 
  // ── Busca alunos sempre que o idTurma mudar ──
  const buscarAlunos = async () => {
    if (!idTurma) {
      setAlunos([]);
      setErro('');
      return;
    }
 
    setCarregando(true);
    setErro('');
 
    try {
      const resAlunos = await fetch(`${API.alunos}/${idTurma}`);
      const dataAlunos = await resAlunos.json();
 
      if (!dataAlunos.sucesso || !Array.isArray(dataAlunos.alunos)) {
        throw new Error('Não foi possível carregar os alunos.');
      }
 
      const resObs = await fetch(`${API.observacoes}/turma/${idTurma}`);
      const dataObs = await resObs.json();
      
      const listaObservacoes = dataObs.sucesso ? dataObs.observacoes : [];
 
      const alunosComObs = dataAlunos.alunos.map(aluno => {
        const obsDoAluno = listaObservacoes.filter(
          obs => obs.tblAluno_idtblAluno === aluno.idtblAluno
        );
 
        return {
          ...aluno,
          id: aluno.idtblAluno, 
          observacoes: obsDoAluno.map(o => {
            const dataObj = new Date(o.dataObservacao);
            const ano = dataObj.getUTCFullYear();
            const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
            const dia = String(dataObj.getUTCDate()).padStart(2, '0');
 
            return {
              id: o.idObservacao_Docente,
              texto: o.descricao,
              data: dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
              dataRaw: `${ano}-${mes}-${dia}`,
              docente: o.docente
            };
          })
        };
      });
 
      setAlunos(alunosComObs);
 
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão ao buscar alunos e observações.');
    } finally {
      setCarregando(false);
    }
  };
 
  useEffect(() => {
    buscarAlunos();
  }, [idTurma]);
 
  // ── Métricas para os cards ───────────────────────────────────────────
  const comObs   = alunos.filter(a => a.observacoes.length > 0).length;
  const semObs   = alunos.filter(a => a.observacoes.length === 0).length;
  const totalObs = alunos.reduce((acc, a) => acc + a.observacoes.length, 0);
 
  // ── Modais ─────────────────────────────────────────────────────────────
  const [modalObs,  setModalObs]  = useState({ open: false, aluno: null });
  const [modalNova, setModalNova] = useState({ open: false, aluno: null, obsEditando: null });
 
  const abrirObs  = (aluno) => setModalObs({ open: true, aluno });
  const fecharObs = ()      => setModalObs({ open: false, aluno: null });
 
  const abrirNova = (aluno, obsEditando = null) => {
    setModalObs({ open: false, aluno: null });
    setModalNova({ open: true, aluno, obsEditando });
  };
  const fecharNova = () => setModalNova({ open: false, aluno: null, obsEditando: null });
 
  // ── Excluir observação com toast de confirmação ────────────────────────
  const handleExcluirObservacao = (idObservacao) => {
    toast('Tem certeza que deseja excluir esta observação?', {
      action: {
        label: 'Excluir',
        onClick: async () => {
          try {
            const res = await fetch(`${API.observacoes}/${idObservacao}`, { method: 'DELETE' });
            const data = await res.json();
 
            if (res.ok && data.sucesso) {
              toast.success('Observação excluída com sucesso!');
              buscarAlunos();
            } else {
              toast.error(`Erro ao excluir: ${data.mensagem || 'Tente novamente.'}`);
            }
          } catch (error) {
            console.error("Erro ao excluir:", error);
            toast.error('Erro de conexão ao tentar excluir. Tente novamente.');
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
      duration: 6000,
    });
  };
 
  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-100 p-5 overflow-auto">
 
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        <span>Turmas/ </span>
        <span className="font-semibold text-gray-800">
          {nomeTurma ? nomeTurma : 'Suas Turmas'}
        </span>
      </nav>
 
      {/* Estado: nenhuma turma selecionada */}
      {!idTurma && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p className="text-base italic">Selecione uma turma na barra lateral para visualizar os alunos.</p>
        </div>
      )}
 
      {/* Estado: carregando */}
      {idTurma && carregando && (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic">
          Carregando alunos da turma...
        </div>
      )}
 
      {/* Estado: erro */}
      {idTurma && !carregando && erro && (
        <div className="flex-1 flex items-center justify-center text-red-500 italic">
          {erro}
        </div>
      )}
 
      {/* Conteúdo principal */}
      {idTurma && !carregando && !erro && (
        <>
          {/* Cards de resumo + Gráfico */}
          <div className="flex gap-4 mb-5">
 
            {/* Card Total */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-4xl font-bold text-gray-800">{alunos.length}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">Total de Alunos</p>
              </div>
              <div className="flex justify-end">
                <svg width="32" height="32" fill="none" viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="#F0F0F0"/>
                  <path d="M4.6 9.6L13.8 6.3l9.2 3.3-4.2 2.5v2.5s-1.1-.8-5-.8-5 .8-5 .8V12.1L4.6 9.6zm0 0v6.7" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.8 13.8v1.5c0 2.87-2.24 5.2-5 5.2s-5-2.33-5-5.2v-1.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
 
            {/* Card Alunos c/ Obs */}
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-4xl font-bold text-amber-600">{comObs}</p>
                <p className="text-sm text-amber-700 mt-1 font-medium">Alunos com Observações</p>
              </div>
              <div className="flex justify-end">
                <svg width="32" height="32" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 37C29.3 37 37 29.3 37 20S29.3 3 20 3 3 10.7 3 20s7.7 17 17 17z" stroke="#D26900" strokeWidth="3.3" strokeLinejoin="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 31a2.1 2.1 0 100-4.2A2.1 2.1 0 0020 31z" fill="#D26900"/>
                  <path d="M20 10v13.4" stroke="#D26900" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
 
            {/* Card Total Obs */}
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-4xl font-bold text-amber-600">{totalObs}</p>
                <p className="text-sm text-amber-700 mt-1 font-medium">Total de Observações Lançadas</p>
              </div>
              <div className="flex justify-end">
                <svg width="32" height="32" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 37C29.3 37 37 29.3 37 20S29.3 3 20 3 3 10.7 3 20s7.7 17 17 17z" stroke="#D26900" strokeWidth="3.3" strokeLinejoin="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 31a2.1 2.1 0 100-4.2A2.1 2.1 0 0020 31z" fill="#D26900"/>
                  <path d="M20 10v13.4" stroke="#D26900" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
 
            {/* Gráfico */}
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm flex items-center justify-center">
              <GraficoRosca comObs={comObs} semObs={semObs} />
            </div>
 
          </div>
 
          {/* Lista de Alunos */}
          {alunos.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center text-gray-400 italic">
              Nenhum aluno encontrado para esta turma.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto min-h-[45vh] max-h-[45vh]">
              {alunos.map((aluno, idx) => (
                <div
                  key={aluno.id}
                  className={`flex items-center justify-between px-5 py-4 ${idx < alunos.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Avatar + Nome + (Ver Observações) */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
 
                    <span className="text-sm font-medium text-gray-800">{aluno.nome}</span>
 
                    {aluno.observacoes.length > 0 && (
                      <button
                        onClick={() => abrirObs(aluno)}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition ml-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.6 19.6c2.5-.3 4.9-.9 7.3-1.75C24.9 15.6 23.8 12.8 23.8 9.8V8.8c0-2.1-.8-4.2-2.3-5.7C20 1.6 18 .75 15.8.75c-2.1 0-4.1.85-5.6 2.35-1.5 1.5-2.3 3.6-2.3 5.7v1c.004 2.98-1.095 5.85-3.08 8.06 2.31.857 4.746 1.453 7.273 1.754M19.6 19.6c-2.53.3-5.087.3-7.614 0M19.6 19.6c.192.603.24 1.242.14 1.867-.1.624-.346 1.216-.717 1.727-.371.511-.857.927-1.419 1.213-.561.287-1.182.436-1.812.436-.63 0-1.25-.149-1.812-.436a3.64 3.64 0 01-1.419-1.213 3.64 3.64 0 01-.717-1.727 3.64 3.64 0 01.14-1.867" stroke="#D26900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="underline">Ver Observações ({aluno.observacoes.length})</span>
                      </button>
                    )}
                  </div>
 
                  {/* Botão + (nova obs) */}
                  <button
                    onClick={() => abrirNova(aluno)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 transition text-xl font-light"
                    title="Adicionar Observação"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
 
      {/* Modais */}
      <ModalObservacoes
        isOpen={modalObs.open}
        onClose={fecharObs}
        aluno={modalObs.aluno}
        onAdicionar={abrirNova}
        onSuccess={buscarAlunos}
        onExcluir={handleExcluirObservacao}
      />
      <ModalNovaObservacao
        isOpen={modalNova.open}
        onClose={fecharNova}
        aluno={modalNova.aluno}
        obsEditando={modalNova.obsEditando}
        onSuccess={buscarAlunos}
      />
    </div>
  );
}