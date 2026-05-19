import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import { API } from '../../config/api';

import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg';
import ModalJustificativa from '../../components/modalJustificativa/ModalJustificativa.jsx';

const intObservacoes = 3

// Variável para evitar repetição nas células de tabela padronizadas
const tableThClasses = "border border-[#ddd] p-[12px_15px] text-left font-bold bg-white sticky top-0 z-10";
const tableTdClasses = "border border-[#ddd] p-[12px_15px] text-left text-lg";
const btnClasses = "border border-black shadow-[3px_3px_5px_gray]"

// Calcula semestre/ano corrente (mês <= 6 => 1º semestre)
const cicloAtual = () => {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  return {
    ano: hoje.getFullYear(),
    semestre: mes <= 6 ? 1 : 2,
  };
};

const ConselhoFinal = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parâmetros vindos da Sidebar (FormConselhoFinal)
  const areaSelecionada = searchParams.get('area');
  const cursoSelecionado = searchParams.get('curso');

  // Estados de tela
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunosComAcaoProposta, setAlunosComAcaoProposta] = useState([]);
  const [alunosComJustificativa, setAlunosComJustificativa] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarTabelaAlunos, setMostrarTabelaAlunos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [situacoesFinais, setSituacoesFinais] = useState({});

  // Estados do Conselho Final (sessão única por usuário+ciclo, abrange várias turmas)
  const [conselhoId, setConselhoId] = useState(null);
  const [donoConselho, setDonoConselho] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregandoConselho, setCarregandoConselho] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  // Ciclo corrente (semestre/ano) — chave da sessão
  const ciclo = useState(cicloAtual)[0];

  // Usuário logado vindo do localStorage (para registrar quem iniciou)
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const idUsuario = usuario.idUsuario;

  // FLAGS DERIVADAS
  const conselhoAtivo = !!conselhoId;
  const naoEhDono = !!(donoConselho && donoConselho.idUsuario && donoConselho.idUsuario !== idUsuario);

  const textoBotaoPrincipal = carregandoConselho
    ? 'Carregando...'
    : modoEdicao
      ? 'Finalizar Conselho'
      : conselhoAtivo
        ? 'Editar Conselho'
        : 'Iniciar Conselho';

  // Botão principal desabilita quando: carregando, esperando confirmação,
  // OU ainda não existe conselho e nenhuma turma foi escolhida.
  const botaoPrincipalDesabilitado =
    carregandoConselho || aguardandoConfirmacao || (!conselhoAtivo && !turmaSelecionada);

  // Modal Justificativa
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSoLeitura, setModalSoLeitura] = useState(false);
  const [alunoModal, setAlunoModal] = useState(null);
  const [situacaoModal, setSituacaoModal] = useState('');
  const [contestacaoModal, setContestacaoModal] = useState('');


  // 1) Carrega turmas baseado em área e curso selecionados na Sidebar
  useEffect(() => {
    if (!areaSelecionada || !cursoSelecionado) return;

    setCarregando(true);
    setTurmaSelecionada(null);
    setAlunosComAcaoProposta([]);
    setAlunosComJustificativa([]);
    setMostrarTabelaAlunos(false);
    setSituacoesFinais({});

    fetch(`${API.turmasFiltro}?area=${encodeURIComponent(areaSelecionada)}&curso=${encodeURIComponent(cursoSelecionado)}`)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && Array.isArray(data.dados)) {
          setTurmas(data.dados.filter(turma => turma.curso === cursoSelecionado));
        } else {
          setTurmas([]);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar turmas:', err);
        setTurmas([]);
      })
      .finally(() => setCarregando(false));
  }, [areaSelecionada, cursoSelecionado]);

  // Carrega alunos da turma (ação proposta e justificativa do Pré-Conselho)
  // E, se houver um Conselho Final ativo, restaura as situações finais já salvas.
  // Recebe o cancelado para abortar atualizações se a turma trocou no meio.
  const carregarAlunos = async (idTurma, conselhoIdFinal, estaCancelado) => {
    try {
      const resP = await fetch(`${API.conselho}/dados-pre-conselho/turma/${idTurma}`);
      const dataP = await resP.json();
      if (estaCancelado && estaCancelado()) return;

      if (!dataP.sucesso) {
        toast.error('Erro ao carregar alunos da turma.');
        return;
      }

      setAlunosComAcaoProposta(dataP.alunosComAcaoProposta);
      setAlunosComJustificativa(dataP.alunosComJustificativa);
      setMostrarTabelaAlunos(true);

      // Situações finais vivem em Avaliacao_Aluno do Conselho FINAL, não do Pré.
      // Só consulta se já existe um conselho final para o ciclo.
      if (!conselhoIdFinal) {
        setSituacoesFinais({});
        return;
      }

      const resF = await fetch(`${API.conselho}/${conselhoIdFinal}/turma/${idTurma}/avaliacoes-alunos`);
      const dataF = await resF.json();
      if (estaCancelado && estaCancelado()) return;

      if (dataF.sucesso) {
        const situacoes = {};
        (dataF.avaliacoes || []).forEach(av => {
          if (av.situacaoFinal) {
            situacoes[av.tblAluno_idtblAluno] = {
              situacaoFinal: av.situacaoFinal,
              contestacao: av.contestacaoSituacaoFinal || '',
            };
          }
        });
        setSituacoesFinais(situacoes);
      }
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      toast.error('Erro ao carregar alunos da turma.');
    }
  };

  // Ao trocar de turma na tabela: localiza o Conselho Final do ciclo
  // (etapa 1 pela turma, etapa 2 pela sessão do usuário), vincula a turma
  // idempotente e carrega os alunos. NÃO cria conselho aqui — criação só
  // acontece no clique explícito de "Iniciar Conselho".
  useEffect(() => {
    if (!turmaSelecionada || !idUsuario) return;

    let cancelado = false;
    const isCancelado = () => cancelado;

    (async () => {
      // Reset visual ao trocar de turma (mantém modoEdicao — uma vez iniciado
      // o Conselho Final, o botão permanece em "Finalizar" ao trocar turmas).
      setAlunosComAcaoProposta([]);
      setAlunosComJustificativa([]);
      setSituacoesFinais({});

      try {
        const r1 = await fetch(
          `${API.conselho}/ativo/${encodeURIComponent('Final')}/turma/${turmaSelecionada}` +
          `?idUsuario=${idUsuario}&semestre=${ciclo.semestre}&ano=${ciclo.ano}`
        );
        const d1 = await r1.json();
        if (cancelado) return;

        if (!d1?.sucesso || !d1.conselho) {
          // Sem conselho do ciclo e sem sessão — botão fica "Iniciar".
          setConselhoId(null);
          setDonoConselho(null);
          setModoEdicao(false);
          await carregarAlunos(turmaSelecionada, null, isCancelado);
          return;
        }

        // Vincula a turma de forma idempotente (ON CONFLICT DO NOTHING).
        // Mandamos parâmetros completos — backend decide pelo lookup em duas etapas.
        const r2 = await fetch(`${API.conselho}/iniciar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipoConselho: 'Final',
            idTurma: turmaSelecionada,
            idUsuario,
            semestre: ciclo.semestre,
            ano: ciclo.ano,
          }),
        });
        const d2 = await r2.json();
        if (cancelado) return;

        const cidFinal = (d2?.sucesso && d2.conselhoId) || d1.conselho.idConselho;
        const dono = d2?.dono || (d1.conselho.Usuario_idUsuario ? {
          idUsuario: d1.conselho.Usuario_idUsuario,
          nomeUsuario: d1.conselho.nomeUsuario,
        } : null);

        setConselhoId(cidFinal);
        setDonoConselho(dono);

        await carregarAlunos(turmaSelecionada, cidFinal, isCancelado);
      } catch (err) {
        console.error('Erro ao localizar/vincular conselho final:', err);
      }
    })();

    return () => { cancelado = true; };
  }, [turmaSelecionada, idUsuario, ciclo.semestre, ciclo.ano]);

  // Iniciar / Editar / Finalizar Conselho Final
  const handleIniciarConselho = async () => {
    if (!turmaSelecionada || !idUsuario) {
      toast.warning('Selecione uma turma para iniciar o conselho.');
      return;
    }
    setCarregandoConselho(true);
    try {
      const resp = await fetch(`${API.conselho}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoConselho: 'Final',
          idTurma: turmaSelecionada,
          idUsuario,
          semestre: ciclo.semestre,
          ano: ciclo.ano,
        }),
      });
      const dados = await resp.json();
      if (!dados.sucesso) throw new Error(dados.mensagem);

      setConselhoId(dados.conselhoId);
      setDonoConselho(dados.dono || null);
      await carregarAlunos(turmaSelecionada, dados.conselhoId);
      setModoEdicao(true);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao iniciar conselho.');
    } finally {
      setCarregandoConselho(false);
    }
  };

  const handleEditarConselho = async () => {
    if (!conselhoId || !turmaSelecionada || !idUsuario) return;
    setCarregandoConselho(true);
    try {
      const resp = await fetch(`${API.conselho}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoConselho: 'Final',
          idTurma: turmaSelecionada,
          idUsuario,
          semestre: ciclo.semestre,
          ano: ciclo.ano,
        }),
      });
      const dados = await resp.json();
      if (!dados.sucesso) throw new Error(dados.mensagem);

      const idFinal = dados.conselhoId || conselhoId;
      if (idFinal !== conselhoId) setConselhoId(idFinal);
      if (dados.dono) setDonoConselho(dados.dono);

      await carregarAlunos(turmaSelecionada, idFinal);
      setModoEdicao(true);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao editar conselho.');
    } finally {
      setCarregandoConselho(false);
    }
  };

  const handleFinalizarConselho = () => {
    if (!conselhoId) return;
    setAguardandoConfirmacao(true);

    const mensagem = naoEhDono
      ? `Você não é o dono deste conselho (iniciado por ${donoConselho?.nomeUsuario || 'outro usuário'}). Finalizar mesmo assim?`
      : 'Deseja finalizar o conselho?';

    toast(mensagem, {
      action: {
        label: 'FINALIZAR',
        onClick: () => executarFinalizacao(),
      },
      cancel: {
        label: 'CANCELAR',
        onClick: () => setAguardandoConfirmacao(false),
      },
      onDismiss: () => setAguardandoConfirmacao(false),
      onAutoClose: () => setAguardandoConfirmacao(false),
      duration: 8000,
    });
  };

  const executarFinalizacao = async () => {
    setAguardandoConfirmacao(false);
    setCarregandoConselho(true);
    try {
      const resp = await fetch(`${API.conselho}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conselhoId }),
      });
      const dados = await resp.json();
      if (!dados.sucesso) throw new Error(dados.mensagem);

      // Mantém conselhoId/dono/alunos na tela. Só sai do modo edição —
      // o botão passa a mostrar "Editar Conselho" para reabrir se precisar.
      setModoEdicao(false);
      toast.success('Conselho finalizado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao finalizar conselho.');
    } finally {
      setCarregandoConselho(false);
    }
  };

  const handleAcaoBotaoPrincipal = () => {
    if (modoEdicao) return handleFinalizarConselho();
    if (conselhoAtivo) return handleEditarConselho();
    return handleIniciarConselho();
  };

  const salvarSituacaoFinal = async (idAluno, novaSituacao, contestacao = null) => {
    setSalvando(true);

    try { 
      const res = await fetch(`${API.conselho}/situacao-final`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idAluno,
          idUsuario,
          situacaoFinal: novaSituacao,
          contestacaoSituacaoFinal: contestacao,
        }),
      });

      const data = await res.json();  

      if (!data.sucesso) {
        alert(data.mensagem || 'Erro ao salvar situação final.');
      }
    } catch (err) {
      alert('Erro ao salvar situação final.');
    } finally {
      setSalvando(false);
    }
  }

   // Botão Salvar: salva todas as situações finais pendentes
  const handleSalvarTudo = async () => {
    const entradas = Object.entries(situacoesFinais);
    if (entradas.length === 0) {
      toast.info('Nenhuma avaliação para salvar.');
      return;
    }
    setSalvando(true);
    try {
      await Promise.all(
        entradas.map(([idAluno, { situacaoFinal, contestacao }]) =>
          fetch(`${API.conselho}/situacao-final`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idAluno: Number(idAluno),
              idUsuario,
              situacaoFinal,
              contestacaoSituacaoFinal: contestacao || null,
            }),
          })
        )
      );
      toast.success('Avaliações salvas com sucesso!');
    } catch (err) {

    } finally {
      setSalvando(false);
    }
  };

  
  // Clique em "Aprovado"
  const handleAprovado = async (aluno) => {
    const novaSituacao = 'Aprovado';
    setSituacoesFinais(prev => ({
      ...prev,
      [aluno.idtblAluno]: { situacaoFinal: novaSituacao, contestacao: '' },
    }));
    await salvarSituacaoFinal(aluno.idtblAluno, novaSituacao, null);
  };

  // Clique em "Aprovado pelo Conselho" ou "Reprovado" → abre modal
  const handleAbrirModal = (aluno, situacao) => {
    setModalSoLeitura(false);
    setAlunoModal(aluno);
    setSituacaoModal(situacao);
    setContestacaoModal('');
    setModalAberto(true);
  };

  // Callback do modal ao salvar justificativa
  const handleSalvarJustificativa = async (contestacao) => {
    setSituacoesFinais(prev => ({
      ...prev,
      [alunoModal.idtblAluno]: { situacaoFinal: situacaoModal, contestacao },
    }));
    await salvarSituacaoFinal(alunoModal.idtblAluno, situacaoModal, contestacao);
    setModalAberto(false);
    setAlunoModal(null);
    setSituacaoModal('');
  };

  // Abre modal em modo leitura para ver contestação já salva
  const handleVerContestacao = (aluno, situacaoAtual) => {
    setAlunoModal(aluno);
    setSituacaoModal(situacaoAtual.situacaoFinal);
    setContestacaoModal(situacaoAtual.contestacao);
    setModalSoLeitura(true);
    setModalAberto(true);
  };

  const getSituacaoAluno = (idtblAluno) => situacoesFinais[idtblAluno] || null;

  return (
    <div id="conselho-tables-container" className="flex flex-col gap-2">

      {/* Barra subtitulo */}
      <nav>
        <span className="text-sm text-gray-500">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Conselhos
          </button>
          {' / '}
          <span className="font-medium text-gray-700">Conselho Final</span>
        </span>
      </nav>

      {naoEhDono && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-md px-4 py-2 text-sm">
          <strong>Iniciado por {donoConselho?.nomeUsuario || 'outro usuário'}.</strong>{' '}
          Você está visualizando o conselho final de outro responsável.
          Alterações serão registradas em seu nome. Evite finalizar sem
          combinar com o dono do conselho.
        </div>
      )}

      {/* SEÇÃO SUPERIOR: TURMAS + JUSTIFICATIVAS LADO A LADO */}
      <section className="flex gap-[15px] items-start w-full mb-6">
        
        {/* Tabela de Turmas  */}
        <div className="flex-1 max-h-[180px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className={`${tableThClasses}`}>Turma(s)</th>
                <th className={`${tableThClasses}`}>Pré Conselho</th>
                <th className={`${tableThClasses}`}>Conselho Final</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="3" className={`${tableTdClasses} text-center text-gray-500`}>
                    Carregando turmas...
                  </td>
                </tr>
              ) : turmas.length > 0 ? (
                turmas.map(turma => (
                  <tr key={turma.idTurma}>
                    <td className={`${tableTdClasses}`}>
                      <label className='flex items-center gap-2 m-0 cursor-pointer'>
                        <input 
                          type="radio" 
                          name="turma" 
                          checked={turmaSelecionada === turma.idTurma}
                          onChange={() => setTurmaSelecionada(turma.idTurma)}
                        /> 
                        {turma.turma}
                      </label>
                    </td>
                    <td className={`${tableTdClasses}`}>{turma.preConselho}</td>
                    <td className={`${tableTdClasses}`}>{turma.preConselho}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={`${tableTdClasses} text-center text-gray-500`}>
                    Nenhuma turma encontrada. Selecione área e curso na Sidebar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tabela de Justificativas - Renderiza somente após selecionar turma */}
        {mostrarTabelaAlunos && (
          <div className="flex-1 max-h-[180px] overflow-y-auto">
            <table className="w-full border-collapse bg-white text-sm">
              <thead>
                <tr>
                  <th className={`${tableThClasses} w-[40%]`}>Aluno</th>
                  <th className={`${tableThClasses} w-[60%]`}>Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {alunosComJustificativa.length > 0 ? (
                  alunosComJustificativa.map(aluno => (
                    <tr key={`just-${aluno.idtblAluno}`}>
                      <td className={`${tableTdClasses}  text-[16px]`}>
                        {aluno.nome}
                      </td>
                      <td className={`${tableTdClasses} text-[#555] italic text-[16px]`}>
                        {aluno.justificativa}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className={`${tableTdClasses} text-center text-[#555] italic`}>
                      Nenhuma justificativa na turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="flex flex-col justify-center gap-[15px] w-[150px] shrink-0 h-[110px] ">
          <button
            onClick={handleAcaoBotaoPrincipal}
            disabled={botaoPrincipalDesabilitado}
            className={`${btnClasses} p-[10px] rounded-[20px] font-bold text-center transition-all ${
              botaoPrincipalDesabilitado
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                : modoEdicao
                  ? 'bg-red-700 text-white cursor-pointer hover:bg-red-800'
                  : conselhoAtivo
                    ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
                    : 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
            }`}>
            {textoBotaoPrincipal}
          </button>
          <button
            onClick={handleSalvarTudo}
            disabled={salvando || !mostrarTabelaAlunos || !modoEdicao}
            className={`${btnClasses} p-[10px] rounded-[20px] font-bold text-center transition-all ${
              salvando || !mostrarTabelaAlunos || !modoEdicao
                ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
                : 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
            }`}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </section>

      {/* SEÇÃO INFERIOR: ALUNOS GERAL - RENDERIZADO CONDICIONALMENTE */}
      {!mostrarTabelaAlunos ? (
          <section className='h-[64vh] flex items-center justify-center'>
            <div className="text-center text-gray-500">
              <p className="text-xl font-medium">Selecione uma turma na tabela acima para ver os alunos. Em seguida clique em "Iniciar Conselho" para começar a avaliar.</p>
            </div>
          </section>
        ) : (
        <section className='h-[64vh] overflow-y-auto'>
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr>
              <th className={`${tableThClasses}`}>Alunos</th>
              <th className={`${tableThClasses}`}>Pré Conselho</th>
              <th className={`${tableThClasses}`}>Conselho final</th>
              <th className={`${tableThClasses}`}>Avaliação Situação Final</th>
              
            </tr>
             
          </thead>
          <tbody>
              {alunosComAcaoProposta.map(aluno => {
                const situacaoAtual = getSituacaoAluno(aluno.idtblAluno);
                const statusSalvo = situacaoAtual?.situacaoFinal;

                return (
                  <tr key={aluno.idtblAluno}>
                    <td className={`${tableTdClasses} `}>{aluno.nome}</td>

                  <td className={`${tableTdClasses} `}>
                    <p>{aluno.acaoProposta}</p>

                    <button className="text-gray-500 text-xs mt-[5px] hover:underline">
                      <div className="flex items-center my-0 mx-1 gap-1">
                        <img src={notificationIcon} alt="" className="w-6 h-6 border border-yellow-600 rounded-full p-[1px]"/>
                        <div className='flex'>
                            <p className="text-m underline">Ver Observações</p>
                            <p className="text-m underline">({intObservacoes})</p>
                        </div>
                    </div>
                    </button>
                  </td>

                  <td className={`${tableTdClasses} text-center `}>
                    {situacaoAtual?.contestacao ? (
                      <button onClick={() => handleVerContestacao(aluno,situacaoAtual)} className=" text-orange-600 px-2 py-1 rounded text-lg underline font-bold ">
                        Ver contestação
                      </button>
                    ) : '-'}
                  </td>

                  <td className={`${tableTdClasses} flex flex-col gap-2 items-center p-2`}>
                    <button
                        onClick={() => handleAprovado(aluno)}
                        disabled={salvando || !modoEdicao}
                        title={!modoEdicao ? 'Clique em "Iniciar Conselho" para avaliar' : ''}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white transition-colors ${
                          !modoEdicao ? 'opacity-60 cursor-not-allowed bg-gray-400' :
                          statusSalvo === 'Aprovado' ? 'bg-green-500' : 'bg-gray-400 hover:bg-green-400'
                        }`}
                      >
                        Aprovado
                      </button>
                      <button
                        onClick={() => handleAbrirModal(aluno, 'Aprovado pelo conselho')}
                        disabled={salvando || !modoEdicao}
                        title={!modoEdicao ? 'Clique em "Iniciar Conselho" para avaliar' : ''}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white transition-colors ${
                          !modoEdicao ? 'opacity-60 cursor-not-allowed bg-gray-400' :
                          statusSalvo === 'Aprovado pelo conselho' ? 'bg-yellow-500' : 'bg-gray-400 hover:bg-yellow-400'
                        }`}
                      >
                        Aprovado pelo Conselho
                      </button>
                      <button
                        onClick={() => handleAbrirModal(aluno, 'Reprovado')}
                        disabled={salvando || !modoEdicao}
                        title={!modoEdicao ? 'Clique em "Iniciar Conselho" para avaliar' : ''}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white transition-colors ${
                          !modoEdicao ? 'opacity-60 cursor-not-allowed bg-gray-400' :
                          statusSalvo === 'Reprovado' ? 'bg-red-500' : 'bg-gray-400 hover:bg-red-400'
                        }`}
                      >
                        Reprovado
                      </button>

                  </td>

                  
                </tr>
              );
            })}
           
          </tbody>
        </table>
      </section>
      )}
      <ModalJustificativa
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); setAlunoModal(null); setSituacaoModal(''); setContestacaoModal(''); setModalSoLeitura(false); }}
        aluno={alunoModal}
        situacao={situacaoModal}
        contestacaoInicial={contestacaoModal}
        soLeitura={modalSoLeitura}
        onSalvar={handleSalvarJustificativa}
      />
    </div>
  );
};

export default ConselhoFinal;