import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API } from '../../config/api';

import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg';
import ModalJustificativa from '../../components/modalJustificativa/ModalJustificativa.jsx';

const intObservacoes = 3

// Variável para evitar repetição nas células de tabela padronizadas
const tableThClasses = "border-b-2 border-r-2 last:border-r-0 border-gray-400 p-[1vh_1.2vw] font-bold bg-white sticky top-0 z-10";
const tableTdClasses = "border-b-2 border-r-2 last:border-r-0 border-gray-400 p-[1vh_1.2vw] text-lg";
const btnClasses = "border border-black shadow-[3px_3px_5px_gray]"

const ConselhoFinal = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parâmetros vindos da Sidebar (FormConselhoFinal)
  const areaSelecionada = searchParams.get('area');
  const cursoSelecionado = searchParams.get('curso');
  
  // Estados
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunosComAcaoProposta, setAlunosComAcaoProposta] = useState([]);
  const [alunosComJustificativa, setAlunosComJustificativa] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarTabelaAlunos, setMostrarTabelaAlunos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [situacoesFinais, setSituacoesFinais] = useState({});
  
  // Usuário logado vindo do localStorage (para registrar quem iniciou)
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const idUsuario = usuario.idUsuario;


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

  // 2) Carrega alunos e restaura situações finais salvas
  const handleAvaliarTurma = async () => {
    if (!turmaSelecionada) return;

    setCarregando(true);
     try {
      // Vincula a turma ao Conselho Final (cria o conselho se não existir)
      const resIniciar = await fetch(`${API.conselho}/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoConselho: 'Conselho-Final',
          idTurma: turmaSelecionada,
          idUsuario,
        }),
      });
      const dataIniciar = await resIniciar.json();
      if (!dataIniciar.sucesso) {
        alert('Erro ao vincular turma ao Conselho Final.');
        return;
      }

      const res = await fetch(`${API.conselho}/dados-pre-conselho/turma/${turmaSelecionada}`);
      const data = await res.json();
      if (data.sucesso) {
        setAlunosComAcaoProposta(data.alunosComAcaoProposta);
        setAlunosComJustificativa(data.alunosComJustificativa);
        setMostrarTabelaAlunos(true);

         // Restaura situações finais já salvas no banco
        const situacoesRestauradas = {};
        
        data.alunosComAcaoProposta.forEach(aluno => {
          if (aluno.situacaoFinal) {
            situacoesRestauradas[aluno.idtblAluno] = {
              situacaoFinal: aluno.situacaoFinal,
              contestacao: aluno.contestacaoSituacaoFinal || '',
            };
          }
        });
        setSituacoesFinais(situacoesRestauradas);

      } else {
        alert('Erro ao carregar alunos da turma.');
      }
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      alert('Erro ao carregar alunos da turma.');
    } finally {
      setCarregando(false);
    }
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
    <div id="conselho-tables-container" className="flex flex-col mx-[2vh]">

      {/* Barra subtitulo */}
      <nav className='my-[1vw]'>
        <span className="text-sm text-gray-500 ">
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

      {/* SEÇÃO SUPERIOR: TURMAS + JUSTIFICATIVAS LADO A LADO */}
      <section className="flex gap-[1vw] items-start w-full mb-[2vh]">
        
        {/* Tabela de Turmas  */}
        <div className="flex-1 max-h-[20vh] overflow-y-auto border-2 border-gray-400">
          <table className="w-full bg-white text-sm box-border border-separate border-spacing-0 [&_tbody_tr:last-child_td]:!border-b-0">
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
          <div className="flex-1 max-h-[20vh] overflow-y-auto border-2 border-gray-400 shadow-[0_0_4px_gray]">
            <table className="w-full bg-white text-sm box-border border-separate border-spacing-0 [&_tbody_tr:last-child_td]:!border-b-0">
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
                      <td className={`${tableTdClasses}  text-[1rem]`}>
                        {aluno.nome}
                      </td>
                      <td className={`${tableTdClasses} text-[#555] italic text-[1rem]`}>
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
        
        <div className="flex flex-col justify-center my-auto gap-[2vh] w-[8vw] shrink-0 max-h-[1vh] ">
          <button 
            onClick={handleAvaliarTurma}
            disabled={!turmaSelecionada || carregando}
            className={`${btnClasses} p-[0.8vh] rounded-[20px] font-bold text-center transition-all ${
              !turmaSelecionada || carregando 
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                : 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
            }`}>
            {carregando ? 'Carregando...' : 'Avaliar turma'}
          </button>
          <button
            onClick={handleSalvarTudo}
            disabled={salvando || !mostrarTabelaAlunos}
            className={`${btnClasses} p-[0.8vh] rounded-[20px] font-bold text-center transition-all ${
              salvando || !mostrarTabelaAlunos
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
              <p className="text-xl font-medium">Selecione uma turma e clique em "Avaliar turma" para iniciar avaliação dos alunos.</p>
            </div>
          </section>
        ) : ( 
        <section className='flex-1 max-h-[62vh] overflow-y-auto border-2 border-gray-400'>
        <table className="w-full bg-white text-sm box-border border-separate border-spacing-0 [&_tbody_tr:last-child_td]:!border-b-0">
          <thead>
            <tr>
              <th className={`${tableThClasses} w-[40%]`}>Alunos</th>
              <th className={`${tableThClasses} w-[10%]`}>Pré Conselho</th>
              <th className={`${tableThClasses} w-[10%]`}>Conselho final</th>
              <th className={`${tableThClasses} w-[20%]`}>Avaliação Situação Final</th>
              
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
                    <p>{aluno.acaoPropostaPreConselho}</p>

                    <button className='text-gray-500 text-xs mt-[5px] hover:underline'>
                      <div className="flex items-center my-0 mx-1 gap-1">
                        <img src={notificationIcon} alt="" className="w-6 h-6 p-[1px]"/>
                        <div className='flex'>
                          <p className="text-m underline text-orange-700">Ver Observações</p>
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
                        disabled={salvando}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[1rem] text-white transition-colors ${
                          statusSalvo === 'Aprovado' ? 'bg-green-500' : 'bg-gray-400 hover:bg-green-400'
                        }`}
                      >
                        Aprovado
                      </button>
                      <button
                        onClick={() => handleAbrirModal(aluno, 'Aprovado pelo conselho')}
                        disabled={salvando}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[1rem] text-white transition-colors ${
                          statusSalvo === 'Aprovado pelo conselho' ? 'bg-yellow-500' : 'bg-gray-400 hover:bg-yellow-400'
                        }`}
                      >
                        Aprovado pelo Conselho
                      </button>
                      <button
                        onClick={() => handleAbrirModal(aluno, 'Reprovado')}
                        disabled={salvando}
                        className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[1rem] text-white transition-colors ${
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