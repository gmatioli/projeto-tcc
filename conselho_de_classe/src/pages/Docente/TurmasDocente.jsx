import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';

// ── Modal: Ver Observações ─────────────────────────────────────────────────
function ModalObservacoes({ isOpen, onClose, aluno, onAdicionar }) {
  if (!isOpen) return null;
 
  const observacoes = aluno?.observacoes || [];
 
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 p-8 shadow-2xl">
 
        <h2 className="text-center text-xl font-bold mb-1 border-b border-gray-300 pb-3">
          Observações Feita pelo Docente
        </h2>
 
        <div className="flex justify-between text-sm text-gray-600 my-3">
          <span>Docente(s): <strong className="text-gray-800">{aluno?.docente || 'Lincoln Bezerra Souza'}</strong></span>
          <span>Aluno: <strong className="text-gray-800">{aluno?.nome}</strong></span>
        </div>
 
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold border-b border-gray-300 w-[140px]">DATA</th>
                <th className="p-3 text-left font-semibold border-b border-gray-300">OBSERVAÇÃO</th>
                <th className="p-3 border-b border-gray-300 w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {observacoes.length > 0 ? (
                observacoes.map((obs, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0">
                    <td className="p-3 text-gray-700">{obs.data}</td>
                    <td className="p-3 text-gray-700">{obs.texto}</td>
                    <td className="p-3 flex gap-2 justify-center">
                      {/* Lápis */}
                      <button
                        onClick={() => onAdicionar(aluno, obs)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </button>
                      {/* Lixeira */}
                      <button className="text-gray-400 hover:text-red-600 transition-colors" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400 italic">
                    Nenhuma observação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
 
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-12 py-2 border border-gray-400 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Modal: Adicionar / Editar Observação ───────────────────────────────────
function ModalNovaObservacao({ isOpen, onClose, aluno, obsEditando }) {
  if (!isOpen) return null;
 
  const [texto, setTexto] = useState(obsEditando?.texto || '');
  const [data, setData] = useState(obsEditando?.data || '');
 
  const handleSalvar = () => {
    if (!texto.trim() || !data) {
      alert('Preencha a observação e a data.');
      return;
    }
    onClose();
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
            <select
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Selecione...</option>
              <option value="18/03/2026">18/03/2026</option>
              <option value="21/03/2026">21/03/2026</option>
              <option value="25/03/2026">25/03/2026</option>
            </select>
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
  const r = 50;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
 
  // Segmento 1 (com observação - laranja)
  const dash1 = circ * pctCom;
  const gap1  = circ - dash1;
 
  // Segmento 2 (sem observação - azul) — começa após o 1º
  const offset2 = circ - dash1;
  const dash2   = circ * pctSem;
 
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-bold text-gray-700 mb-2">Gráfico de Alunos</p>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Anel base */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="22" />
        {/* Segmento sem obs */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#3b82f6" strokeWidth="22"
          strokeDasharray={`${dash2} ${circ - dash2}`}
          strokeDashoffset={-offset2}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Segmento com obs */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#f97316" strokeWidth="22"
          strokeDasharray={`${dash1} ${gap1}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="flex flex-col gap-1 mt-1 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/> Sem Observação
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"/> Com Observação
        </span>
      </div>
    </div>
  );
}
 
// ── Página Principal ───────────────────────────────────────────────────────
export function TurmasDocente() {
  const navigate = useNavigate();
 
  const alunos = [
    { id: 1, nome: 'Jorge Marques de Salves',  observacoes: [
      { data: '18/03/2026', texto: 'Chegou Atrasado, 08:01.' },
      { data: '21/03/2026', texto: 'Não entregou tarefa' },
      { data: '21/03/2026', texto: 'Utilizou celular em sala mesmo após ter atenção chamada pelo docente' },
    ]},
    { id: 2, nome: 'Maria Silva do Céu',        observacoes: [
      { data: '18/03/2026', texto: 'Saiu mais cedo sem justificativa.' },
      { data: '20/03/2026', texto: 'Faltou à prova de recuperação.' },
      { data: '22/03/2026', texto: 'Não realizou atividade em grupo.' },
      { data: '25/03/2026', texto: 'Novamente sem uniforme.' },
    ]},
    { id: 3, nome: 'Lucas Almeida',             observacoes: [] },
    { id: 4, nome: 'Beatriz Santos',            observacoes: [
      { data: '19/03/2026', texto: 'Excelente participação em aula.' },
      { data: '23/03/2026', texto: 'Entregou atividade com atraso.' },
      { data: '26/03/2026', texto: 'Apresentou comportamento inadequado na prática.' },
      { data: '28/03/2026', texto: 'Desrespeito com colega de turma.' },
      { data: '30/03/2026', texto: 'Chegou atrasado na aula prática.' },
      { data: '01/04/2026', texto: 'Saiu sem autorização.' },
      { data: '03/04/2026', texto: 'Não trouxe material necessário.' },
      { data: '05/04/2026', texto: 'Faltou a prova.' },
    ]},
  ];
 
  const comObs = alunos.filter(a => a.observacoes.length > 0).length;
  const semObs = alunos.filter(a => a.observacoes.length === 0).length;
  const totalObs = alunos.reduce((acc, a) => acc + a.observacoes.length, 0);
 
  const [modalObs, setModalObs]         = useState({ open: false, aluno: null });
  const [modalNova, setModalNova]       = useState({ open: false, aluno: null, obsEditando: null });
 
  const abrirObs  = (aluno) => setModalObs({ open: true, aluno });
  const fecharObs = ()       => setModalObs({ open: false, aluno: null });
 
  const abrirNova = (aluno, obsEditando = null) => {
    setModalObs({ open: false, aluno: null });
    setModalNova({ open: true, aluno, obsEditando });
  };
  const fecharNova = () => setModalNova({ open: false, aluno: null, obsEditando: null });
 
  return (
    <div className="flex flex-col h-full bg-gray-100 p-5 overflow-auto">
 
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        <span>Turmas/ </span>
        <span className="font-semibold text-gray-800">Suas Turmas</span>
      </nav>
 
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
              <path d="M18.8 13.8v1.5c0 2.87-2.24 5.2-5 5.2s-5-2.33-5-5.2v-1.5"  stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {alunos.map((aluno, idx) => (
          <div
            key={aluno.id}
            className={`flex items-center justify-between px-5 py-4 ${idx < alunos.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            {/* Ícone + Nome + (Ver Observações) */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
 
              <span className="text-sm font-medium text-gray-800">{aluno.nome}</span>
 
              {/* Link Ver Observações */}
              {aluno.observacoes.length > 0 && (
                <button
                  onClick={() => abrirObs(aluno)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition ml-2"
                >
                  {/* Sino */}
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
 
      {/* Modais */}
      <ModalObservacoes
        isOpen={modalObs.open}
        onClose={fecharObs}
        aluno={modalObs.aluno}
        onAdicionar={abrirNova}
      />
      <ModalNovaObservacao
        isOpen={modalNova.open}
        onClose={fecharNova}
        aluno={modalNova.aluno}
        obsEditando={modalNova.obsEditando}
      />
    </div>
  );
}