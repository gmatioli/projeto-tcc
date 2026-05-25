import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API, authFetch } from '../../config/api';
 
 
export function InstrumentoAcompanhamento() {
  const navigate = useNavigate();
 
  const formatarNome = (texto) => {
  if (!texto) return '';
    return texto
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };
 
  const [docenteNome, setDocenteNome] = useState('Carregando...');
 
  useEffect(() => {
    const carregarPerfil = async () => {
      const logado = localStorage.getItem('usuarioLogado');
      
      if (logado) {
        const { email } = JSON.parse(logado);
        
        try {
          const resposta = await authFetch(`${API.perfil}/${email}`);
          const dados = await resposta.json();
 
          if (dados.sucesso) {
            setDocenteNome(dados.usuario.nomeUsuario);
          } else {
            setDocenteNome("Usuário não encontrado");
          }
        } catch (erro) {
          console.error("Erro de conexão:", erro);
          setDocenteNome("Erro ao carregar docente");
        }
      }
    };
 
    carregarPerfil();
  }, []);
 
  // ── Campos de cabeçalho ──────────────────────────────────────────────────
  const [turma,    setTurma]    = useState('');
  const [aluno,    setAluno]    = useState('');
  const [componente, setComponente] = useState('');
 
  // ── Estados Dropdown ─────────────────────────────────────────
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
 
  // 1. Busca as turmas do docente ao carregar a página
  useEffect(() => {
    const logado = localStorage.getItem('usuarioLogado');
    if (logado) {
      const { idUsuario } = JSON.parse(logado);
      
      if (idUsuario) {
        authFetch(`${API.turmaDocente}/docente/${idUsuario}/sidebar-filtros`)
          .then(res => res.json())
          .then(data => {
            // Verifica o formato da resposta (igual na sidebar)
            if (data.sucesso && Array.isArray(data.dados)) {
              setTurmasDisponiveis(data.dados);
            } else if (Array.isArray(data)) {
              setTurmasDisponiveis(data);
            }
          })
          .catch(err => console.error('Erro ao buscar turmas:', err));
      }
    }
  }, []);
 
  // 2. Busca os alunos sempre que uma turma for selecionada
  useEffect(() => {
    if (!turma) {
      setAlunosDisponiveis([]);
      setAluno(''); // Limpa o aluno se trocar de turma
      return;
    }
 
    authFetch(`${API.alunos}/${turma}`)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && Array.isArray(data.alunos)) {
          setAlunosDisponiveis(data.alunos);
        }
      })
      .catch(err => console.error('Erro ao buscar alunos:', err));
  }, [turma]);
 
  // ── Dificuldades: Execução do Trabalho ──────────────────────────────────
  const [exec, setExec] = useState({
    qualidadeTrabalho: false, iniciativa: false, comprometimento: false,
    ritmoTrabalho: false,     participacao: false, focoResultado: false,
    manuseioMaquinas: false,  cumprimentoMetas: false, naoRealizacaoAtividades: false,
    outroExec: '',
  });
 
  // ── Dificuldades: Higiene e Segurança ───────────────────────────────────
  const [hig, setHig] = useState({
    usoEPI: false,          cuidadosBensEscola: false,
    normasSeguranca: false, higienePessoal: false,
    cuidadosAmbiente: false, usoUniforme: false,
    outroHig: '',
  });
 
  // ── Qualidades Pessoais ──────────────────────────────────────────────────
  const [qual, setQual] = useState({
    comunicar: false,  motivacao: false,   assiduidade: false,
    ouvir: false,      disciplina: false,  conhecimento: false,
    sociabilidade: false, cooperacao: false, etica: false,
    outroQual: '',
  });
 
  // ── Ações do Docente: Sugestões ao Aluno ────────────────────────────────
  const [sugAluno, setSugAluno] = useState({
    frequentar: false,      manterAtento: false,    refazerAvaliacoes: false,
    estudarConteudos: false, observarRegras: false,  procurarPlantao: false,
    organizarHorario: false, realizarTarefas: false, realizarReposicao: false,
    fazerAnotacoes: false,  participarEfetivamente: false,
    outroSugAluno: '',
  });
 
  // ── Sugestões para Responsáveis ─────────────────────────────────────────
  const [sugResp, setSugResp] = useState({
    habitosEstudo: false, manterContato: false,
    conciliarHorario: false, atentarFrequencia: false,
    acompanharAtividade: false,
  });
 
  // ── Encaminhar Para ──────────────────────────────────────────────────────
  const [encaminhar, setEncaminhar] = useState({
    opp: false, aqv: false, ct: false, cap: false,
  });
 
  // ── Critérios Críticos ───────────────────────────────────────────────────
  const [criterios, setCriterios] = useState('');
 
  // ── Providências da Escola ───────────────────────────────────────────────
  const [prov, setProv] = useState({
    opp: false, planoReposicao: false, outro: '',
    aqv: false, reuniaoResp: false,
    ct:  false, planoRecuperacao: false,
    cap: false, sancaoDisciplinar: false,
  });
  const [obsEscola, setObsEscola] = useState('');
 
  // ── Plano de Recuperação ─────────────────────────────────────────────────
  const [plano, setPlano] = useState({
    recuperacaoConteudo: false,
    reposicaoAusencia: false,
  });
 
  // ── Helper: checkbox genérico ────────────────────────────────────────────
  const toggle = (setter, field) => setter(prev => ({ ...prev, [field]: !prev[field] }));
 
  // ── Geração do documento Word via backend ────────────────────────────────
  const handleGerar = async () => {
    if (!turma || !aluno) {
      toast.warning('Selecione a turma e o aluno antes de gerar o documento.');
      return;
    }
 
    const turmaObj = turmasDisponiveis.find(t => t.idTurma.toString() === turma.toString());
    const nomeDaTurma = turmaObj ? turmaObj.turma : '';
 
    const payload = {
      turma: nomeDaTurma, aluno, componente,
      exec, hig, qual,
      sugAluno, sugResp, encaminhar,
      criterios, prov, obsEscola, plano, docente: formatarNome(docenteNome)
    };
 
    const toastId = toast.loading('Gerando documento, aguarde...');
 
    try {
      const response = await authFetch(API.instrumento, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
 
      if (!response.ok) {
        const err = await response.json();
        toast.error(`Erro ao gerar documento: ${err.mensagem}`, { id: toastId });
        return;
      }
 
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'instrumento_acompanhamento.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
 
      toast.success('Documento gerado e baixado com sucesso!', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Erro de conexão ao gerar o documento. Tente novamente.', { id: toastId });
    }
  };
 
  // ── Sub-componentes de seção ─────────────────────────────────────────────
  const SectionHeader = ({ label }) => (
    <div className="bg-gray-300 px-3 py-1 text-lg font-bold uppercase tracking-wide text-gray-800 rounded-sm mb-2">
      {label}
    </div>
  );
 
  const SubHeader = ({ label }) => (
    <p className="text-lg px-1 font-bold text-gray-800 mb-2">{label}</p>
  );
 
  const Chk = ({ label, checked, onChange }) => (
    <label className="flex text-lg px-1 items-start gap-2 text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-[7px] accent-red-600 shrink-0"
      />
      <span>{label}</span>
    </label>
  );
 
  return (
    <div className="flex flex-col h-full bg-gray-100 p-5 overflow-auto">
 
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto overflow-hidden">
 
        {/* Título */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-200">
          <h1 className="text-center text-xl font-bold text-gray-800">
            Gerar Instrumento de Acompanhamento de Aluno
          </h1>
        </div>
 
        {/* Cabeçalho de campos */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4 mb-2">
            {/* Turma */}
            <div className="flex-1">
              <label className="block text-lg font-semibold text-gray-700 mb-1">Turma(*):</label>
              <select
                value={turma}
                onChange={e => setTurma(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-base focus:outline-none focus:ring-1 focus:ring-red-400"
              >
                <option value="">Selecione...</option>
                {turmasDisponiveis.map(t => (
                  <option key={t.idTurma} value={t.idTurma}>{t.turma}</option>
                ))}
              </select>
            </div>
            
            {/* Aluno */}
            <div className="flex-1">
              <label className={`block text-lg font-semibold mb-1 ${!turma ? 'text-gray-400' : 'text-gray-700'}`}>
                Aluno(*):
              </label>
              <select
                value={aluno}
                onChange={e => setAluno(e.target.value)}
                disabled={!turma}
                className={`w-full border rounded px-2 py-1.5 text-base focus:outline-none focus:ring-1 focus:ring-red-400 ${!turma ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300'}`}
              >
                <option value="">Selecione...</option>
                {alunosDisponiveis.map(a => (
                  <option key={a.idtblAluno} value={a.nome}>{a.nome}</option>
                ))}
              </select>
            </div>
            {/* Componente Curricular */}
            <div className="flex-1">
              <label className="block text-lg font-semibold text-gray-700 mb-1">Componente Curricular:</label>
              <input
                type="text"
                value={componente}
                onChange={e => setComponente(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-base focus:outline-none focus:ring-1 focus:ring-red-400"
                placeholder="Ex: Banco de Dados"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 capitalize">
            Docente: {docenteNome}
          </p>
        </div>
 
        {/* Corpo rolável com todas as seções */}
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto flex flex-col gap-5">
 
          {/* ── DIFICULDADES OBSERVADAS ─────────────────────────────────── */}
          <div>
            <SectionHeader label="Dificuldades Observadas:" />
 
            {/* Execução do Trabalho */}
            <SubHeader label="Execução do Trabalho:" />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-3">
              <Chk label="Qualidade do Trabalho"    checked={exec.qualidadeTrabalho}    onChange={() => toggle(setExec,'qualidadeTrabalho')} />
              <Chk label="Iniciativa"                checked={exec.iniciativa}            onChange={() => toggle(setExec,'iniciativa')} />
              <Chk label="Comprometimento"           checked={exec.comprometimento}       onChange={() => toggle(setExec,'comprometimento')} />
              <Chk label="Ritmo de Trabalho"         checked={exec.ritmoTrabalho}         onChange={() => toggle(setExec,'ritmoTrabalho')} />
              <Chk label="Participação"              checked={exec.participacao}          onChange={() => toggle(setExec,'participacao')} />
              <Chk label="Foco em Resultado"         checked={exec.focoResultado}         onChange={() => toggle(setExec,'focoResultado')} />
              <Chk label="Manuseio e Utilização de máquinas e equipamentos de forma adequada" checked={exec.manuseioMaquinas} onChange={() => toggle(setExec,'manuseioMaquinas')} />
              <Chk label="Cumprimento de metas"      checked={exec.cumprimentoMetas}      onChange={() => toggle(setExec,'cumprimentoMetas')} />
              <Chk label="Não realização das atividades propostas" checked={exec.naoRealizacaoAtividades} onChange={() => toggle(setExec,'naoRealizacaoAtividades')} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-gray-700">Outro:</span>
              <input type="text" value={exec.outroExec} onChange={e => setExec(p=>({...p,outroExec:e.target.value}))} className="flex-1 border border-gray-300 rounded px-2 py-1 text-base" />
            </div>
 
            {/* Higiene e Segurança */}
            <SubHeader label="Higiene e Segurança no Trabalho:" />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-3">
              <Chk label="Uso do EPI ou EPC"                       checked={hig.usoEPI}              onChange={() => toggle(setHig,'usoEPI')} />
              <Chk label="Cuidados com os bens da Escola"          checked={hig.cuidadosBensEscola}  onChange={() => toggle(setHig,'cuidadosBensEscola')} />
              <Chk label="Higiene Pessoal"                         checked={hig.higienePessoal}      onChange={() => toggle(setHig,'higienePessoal')} />
              <Chk label="Atendimento às normas de segurança"      checked={hig.normasSeguranca}     onChange={() => toggle(setHig,'normasSeguranca')} />
              <Chk label="Cuidados ambientes - organização e limpeza do ambiente" checked={hig.cuidadosAmbiente} onChange={() => toggle(setHig,'cuidadosAmbiente')} />
              <Chk label="Uso do uniforme (camiseta/avental)"      checked={hig.usoUniforme}         onChange={() => toggle(setHig,'usoUniforme')} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-gray-700">Outro:</span>
              <input type="text" value={hig.outroHig} onChange={e => setHig(p=>({...p,outroHig:e.target.value}))} className="flex-1 border border-gray-300 rounded px-2 py-1 text-base" />
            </div>
 
            {/* Qualidades Pessoais */}
            <SubHeader label="Qualidades Pessoais:" />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-3">
              <Chk label="Saber se comunicar"                      checked={qual.comunicar}    onChange={() => toggle(setQual,'comunicar')} />
              <Chk label="Motivação/interesse"                     checked={qual.motivacao}    onChange={() => toggle(setQual,'motivacao')} />
              <Chk label="Assiduidade (atrasos ou falta)"          checked={qual.assiduidade}  onChange={() => toggle(setQual,'assiduidade')} />
              <Chk label="Habilidade para ouvir"                   checked={qual.ouvir}        onChange={() => toggle(setQual,'ouvir')} />
              <Chk label="Conduta/disciplinar"                     checked={qual.disciplina}   onChange={() => toggle(setQual,'disciplina')} />
              <Chk label="Conhecimento"                            checked={qual.conhecimento} onChange={() => toggle(setQual,'conhecimento')} />
              <Chk label="Sociabilidade (relacionamento interpessoal)" checked={qual.sociabilidade} onChange={() => toggle(setQual,'sociabilidade')} />
              <Chk label="Cooperação"                              checked={qual.cooperacao}   onChange={() => toggle(setQual,'cooperacao')} />
              <Chk label="Ética profissional"                      checked={qual.etica}        onChange={() => toggle(setQual,'etica')} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-700">Outro:</span>
              <input type="text" value={qual.outroQual} onChange={e => setQual(p=>({...p,outroQual:e.target.value}))} className="flex-1 border border-gray-300 rounded px-2 py-1 text-base" />
            </div>
          </div>
 
          {/* ── AÇÕES DO DOCENTE ─────────────────────────────────────────── */}
          <div>
            <SectionHeader label="Ações do Docente:" />
 
            {/* Sugestões ao Aluno */}
            <SubHeader label="Sugestões para o aluno:" />
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-3">
              <Chk label="Frequentar regularmente as aulas"                    checked={sugAluno.frequentar}           onChange={() => toggle(setSugAluno,'frequentar')} />
              <Chk label="Manter-se atento nas aulas"                         checked={sugAluno.manterAtento}         onChange={() => toggle(setSugAluno,'manterAtento')} />
              <Chk label="Refazer avaliações ou exercícios"                   checked={sugAluno.refazerAvaliacoes}    onChange={() => toggle(setSugAluno,'refazerAvaliacoes')} />
              <Chk label="Estudar os conteúdos desenvolvidos"                 checked={sugAluno.estudarConteudos}     onChange={() => toggle(setSugAluno,'estudarConteudos')} />
              <Chk label="Observar as regras de boa convivência social"       checked={sugAluno.observarRegras}       onChange={() => toggle(setSugAluno,'observarRegras')} />
              <Chk label="Procurar Plantão de Dúvidas ou auxílio de monitoria" checked={sugAluno.procurarPlantao}    onChange={() => toggle(setSugAluno,'procurarPlantao')} />
              <Chk label="Fazer anotações"                                    checked={sugAluno.fazerAnotacoes}       onChange={() => toggle(setSugAluno,'fazerAnotacoes')} />
              <Chk label="Participar efetivamente das aulas"                  checked={sugAluno.participarEfetivamente} onChange={() => toggle(setSugAluno,'participarEfetivamente')} />
              <Chk label="Organizar horário para estudar"                     checked={sugAluno.organizarHorario}     onChange={() => toggle(setSugAluno,'organizarHorario')} />
              <Chk label="Realizar as tarefas propostas"                      checked={sugAluno.realizarTarefas}      onChange={() => toggle(setSugAluno,'realizarTarefas')} />
              <Chk label="Realizar a reposição de ausência ou a recuperação, conforme plano (vide verso)" checked={sugAluno.realizarReposicao} onChange={() => toggle(setSugAluno,'realizarReposicao')} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-gray-700">Outro:</span>
              <input type="text" value={sugAluno.outroSugAluno} onChange={e => setSugAluno(p=>({...p,outroSugAluno:e.target.value}))} className="flex-1 border border-gray-300 rounded px-2 py-1 text-base" />
            </div>
 
            {/* Sugestões para Responsáveis + Encaminhar */}
            <div className="flex gap-6">
              <div className="flex-1">
                <SubHeader label="Sugestões para Responsáveis:" />
                <div className="flex flex-col gap-2 mb-3">
                  <Chk label="Propiciar e estimular hábitos de estudo diários" checked={sugResp.habitosEstudo}    onChange={() => toggle(setSugResp,'habitosEstudo')} />
                  <Chk label="Manter contato com a Escola"                     checked={sugResp.manterContato}    onChange={() => toggle(setSugResp,'manterContato')} />
                  <Chk label="Conciliar horário de estudo e lazer"             checked={sugResp.conciliarHorario} onChange={() => toggle(setSugResp,'conciliarHorario')} />
                  <Chk label="Atentar para a frequência regular às aulas"      checked={sugResp.atentarFrequencia} onChange={() => toggle(setSugResp,'atentarFrequencia')} />
                  <Chk label="Acompanhar atividade e desempenho escolar"       checked={sugResp.acompanharAtividade} onChange={() => toggle(setSugResp,'acompanharAtividade')} />
                </div>
              </div>
 
              {/* Encaminhar Para */}
              <div className="w-[160px]">
                <SubHeader label="Encaminhar Para:" />
                <div className="flex flex-col gap-2">
                  <Chk label="OPP" checked={encaminhar.opp} onChange={() => toggle(setEncaminhar,'opp')} />
                  <Chk label="AQV" checked={encaminhar.aqv} onChange={() => toggle(setEncaminhar,'aqv')} />
                  <Chk label="CT"  checked={encaminhar.ct}  onChange={() => toggle(setEncaminhar,'ct')} />
                  <Chk label="CAP" checked={encaminhar.cap} onChange={() => toggle(setEncaminhar,'cap')} />
                </div>
              </div>
            </div>
          </div>
 
          {/* ── CRITÉRIOS CRÍTICOS NÃO ALCANÇADOS ──────────────────────── */}
          <div>
            <SectionHeader label="Critérios Críticos Não Alcançados:" />
            <p className="text-lg text-gray-700 mb-1">Descreva abaixo:</p>
            <textarea
              value={criterios}
              onChange={e => setCriterios(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>
 
          {/* ── PROVIDÊNCIAS DA ESCOLA ──────────────────────────────────── */}
          <div>
            <SectionHeader label="Providências da Escola:" />
            <SubHeader label="Orientação:" />
 
            <div className="flex gap-8 mb-3">
              {/* Coluna esquerda */}
              <div className="flex flex-col gap-2">
                <Chk label="OPP" checked={prov.opp} onChange={() => toggle(setProv,'opp')} />
                <Chk label="AQV" checked={prov.aqv} onChange={() => toggle(setProv,'aqv')} />
                <Chk label="CT"  checked={prov.ct}  onChange={() => toggle(setProv,'ct')} />
                <Chk label="CAP" checked={prov.cap} onChange={() => toggle(setProv,'cap')} />
              </div>
              {/* Coluna central */}
              <div className="flex flex-col gap-2">
                <Chk label="Plano de Reposição"         checked={prov.planoReposicao}    onChange={() => toggle(setProv,'planoReposicao')} />
                <Chk label="Reunião com Responsáveis"   checked={prov.reuniaoResp}        onChange={() => toggle(setProv,'reuniaoResp')} />
                <Chk label="Plano de Recuperação"       checked={prov.planoRecuperacao}   onChange={() => toggle(setProv,'planoRecuperacao')} />
                <Chk label="Aplicação de Sanção Disciplinar" checked={prov.sancaoDisciplinar} onChange={() => toggle(setProv,'sancaoDisciplinar')} />
              </div>
              {/* Coluna direita - Outro */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-lg text-gray-700">Outro:</span>
                <input type="text" value={prov.outro} onChange={e => setProv(p=>({...p,outro:e.target.value}))} className="border border-gray-300 rounded px-2 py-1 text-base" />
              </div>
            </div>
 
            {/* Observações OPP/AQV/CT/CAP */}
            <p className="text-lg font-semibold text-gray-800 mb-1">Observações(OPP/AQV/CT/CAP)</p>
            <p className="text-lg text-gray-600 mb-1">Descreva Aqui:</p>
            <textarea
              value={obsEscola}
              onChange={e => setObsEscola(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>
 
          {/* ── PLANO PARA RECUPERAÇÃO ──────────────────────────────────── */}
          <div>
            <SectionHeader label="Plano para Recuperação ou Reposição de Ausência" />
            <div className="flex flex-col gap-2">
              <Chk
                label="Recuperação - Conteúdo (PEARE) ou de Fundamentos/Capacidades (Competências)"
                checked={plano.recuperacaoConteudo}
                onChange={() => toggle(setPlano,'recuperacaoConteudo')}
              />
              <Chk
                label="Reposição de ausência"
                checked={plano.reposicaoAusencia}
                onChange={() => toggle(setPlano,'reposicaoAusencia')}
              />
            </div>
          </div>
 
        </div>
 
        {/* Botões fixos no rodapé */}
        <div className="flex justify-center gap-6 px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/docente/home')}
            className="px-10 py-2 border border-gray-400 rounded-full text-gray-700 bg-white hover:bg-gray-100 transition font-medium text-lg"
          >
            Fechar
          </button>
          <button
            onClick={handleGerar}
            className="px-10 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-medium text-lg shadow"
          >
            Gerar
          </button>
        </div>
 
      </div>
    </div>
  );
}