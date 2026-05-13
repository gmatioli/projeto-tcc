import React, { useState,  useEffect, useCallback  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'

import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

import ModalAvaliacaoAlunos from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoAlunos';
import ModalAvaliacaoTurma from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoTurma';

const API = 'http://localhost:3001/api/conselho';

// Calcula semestre/ano corrente (mês <= 6 => 1º semestre)
const cicloAtual = () => {
  const hoje = new Date();
  return {
    ano: hoje.getFullYear(),
    semestre: hoje.getMonth() + 1 <= 6 ? 1 : 2
  };
};

const cardInfo = "flex flex-col justify-between  border rounded-[15px] h-auto w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";
  

export function ConselhoIntermediario() {
    const navigate = useNavigate();

    // Pegamos apenas a turma e o nome da turma da URL.
    const [searchParams] = useSearchParams();
    const idTurma = searchParams.get('turma');
    const nomeTurma = searchParams.get('nomeTurma');

    // Usuário logado vindo do localStorage (para registrar quem iniciou)
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    const idUsuario = usuario.idUsuario;

    // =====================================================================
    // ESTADOS
    // =====================================================================
    // conselhoId é restaurado do localStorage para persistir entre reloads.
    // Se tiver valor => existe um conselho em andamento.
    // Se for null   => nenhum conselho iniciado.
    const [conselhoId, setConselhoId] = useState(() => {
        const v = localStorage.getItem('conselhoIntermediarioAtivo');
        return v ? Number(v) : null;
    });
    const [conselhoVerificado, setConselhoVerificado] = useState(false);
    const [turmaVinculadaAoConselho, setTurmaVinculadaAoConselho] = useState(false);

    // Ciclo (semestre/ano) corrente — usado para reusar/abrir conselho no mesmo período
    const ciclo = useState(cicloAtual)[0];
    const [alunos, setAlunos] = useState([]);                          // lista de alunos da turma atual
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);  // IDs marcados nos checkboxes
    const [carregando, setCarregando] = useState(false);               // loading da lista de alunos
    const [carregandoConselho, setCarregandoConselho] = useState(false); // loading dos botões iniciar/finalizar
    const [avaliacaoTurma, setAvaliacaoTurma] = useState(null);        // avaliação da turma (null se ainda não foi feita)
    const [alunosAvaliados, setAlunosAvaliados] = useState({});        // mapa { idAluno: avaliacao }


    // Estados independentes para controlar cada modal
    const [isModalTurmaOpen, setIsModalTurmaOpen] = useState(false);
    const [isModalAlunosOpen, setIsModalAlunosOpen] = useState(false);

     // =====================================================================
    // FLAGS DERIVADAS  (calculadas a partir dos estados acima)
    // =====================================================================
    // Existe um conselho rodando?
    const conselhoAtivo = !!conselhoId;
    // A turma atual já tem avaliação registrada neste conselho?
    const turmaJaAvaliada = !!avaliacaoTurma;

    // Regras de habilitação (centralizadas aqui pra ficar fácil de manter):
    //  - botoesDesabilitados: bloqueia tudo enquanto o conselho não for iniciado
    //  - podeAvaliarAlunos: precisa ter conselho + avaliação da turma + alunos marcados
    const botoesDesabilitados = !conselhoAtivo;
    const podeAvaliarAlunos =
        conselhoAtivo && turmaJaAvaliada && alunosSelecionados.length > 0;

     // O botão principal (Iniciar/Finalizar) só fica bloqueado se está
    // carregando OU se não tem turma/usuário para iniciar
    const botaoPrincipalDesabilitado =
        carregandoConselho || (!conselhoAtivo && (!idTurma || !idUsuario));


    // =====================================================================
    // CONTROLE DOS MODAIS
    // =====================================================================
    // Modal da TURMA: só abre se há conselho ativo
    // (Serve tanto para CRIAR a primeira avaliação quanto para EDITAR a existente)
    const handleOpenModalTurma = () => {
        if (!conselhoAtivo) return; // proteção contra cliques indevidos
        setIsModalTurmaOpen(true);
    };
    const handleCloseModalTurma = () => setIsModalTurmaOpen(false);

    // Modal de ALUNOS: só abre se todas as condições estiverem ok
    // (conselho ativo + turma avaliada + alunos selecionados)
    const handleOpenModalAlunos = () => {
        if (!podeAvaliarAlunos) return; // proteção
        setIsModalAlunosOpen(true);
    };
    const handleCloseModalAlunos = () => setIsModalAlunosOpen(false);
    
    // =====================================================================
    // RECARREGAR DADOS DO CONSELHO (avaliação da turma + alunos avaliados)
    // =====================================================================
    // Usado após iniciar conselho, após salvar avaliações ou após trocar de turma.
    const recarregarConselho = useCallback(async (cid, tid) => {
      if (!cid || !tid) return null;
      try {
          const [respT, respA] = await Promise.all([
              fetch(`${API}/${cid}/avaliacao-turma/${tid}`).then(r => r.json()),
              fetch(`${API}/${cid}/turma/${tid}/avaliacoes-alunos`).then(r => r.json()),
          ]);

          const avaliacao = respT?.avaliacao || null;
          setAvaliacaoTurma(avaliacao);

          const mapa = {};
          (respA?.avaliacoes || []).forEach(a => {
              mapa[a.tblAluno_idtblAluno] = a;
          });
          setAlunosAvaliados(mapa);

          return avaliacao; // pro handleIniciarConselho decidir se abre modal
      } catch (e) {
          console.error('Erro ao recarregar conselho:', e);
          return null;
      }
    }, []);

    const turmaEstaVinculadaAoConselho = useCallback(async (cid, tid) => {
      if (!cid || !tid) return false;
      try {
        const resp = await fetch(`${API}/${cid}`);
        const data = await resp.json();
        return (
          data?.sucesso &&
          Array.isArray(data.conselho?.turmas) &&
          data.conselho.turmas.some(t => String(t.idTurma) === String(tid))
        );
      } catch (e) {
        console.error('Erro ao verificar se a turma pertence ao conselho:', e);
        return false;
      }
    }, []);

      // 1) Carrega alunos da turma sempre que a turma muda
    useEffect(() => {
        if(!idTurma) return;
        setAlunosAvaliados({});
        setAlunosSelecionados([]);

        setCarregando(true);
        fetch(`http://localhost:3001/api/alunos/${idTurma}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) setAlunos(data.alunos);
            })
            .finally(() => setCarregando(false));
    }, [idTurma]);

     // 1b) Ao montar: se já existe conselho do ciclo, restaura apenas se
    // a turma atual pertencer a ele. Isso evita abrir o modal por causa de
    // um conselho de outra turma no mesmo semestre.
    useEffect(() => {
        if (conselhoVerificado || !idUsuario || !idTurma) return;

        const validarConselhoExistente = async () => {
            try {
                const storedId = localStorage.getItem('conselhoIntermediarioAtivo');
                const idArmazenado = storedId ? Number(storedId) : null;

                if (idArmazenado) {
                    const vinculada = await turmaEstaVinculadaAoConselho(idArmazenado, idTurma);
                    if (vinculada) {
                        setConselhoId(idArmazenado);
                        setTurmaVinculadaAoConselho(true);
                        const avaliacao = await recarregarConselho(idArmazenado, idTurma);
                        if (!avaliacao) setIsModalTurmaOpen(true);
                        setConselhoVerificado(true);
                        return;
                    }

                    localStorage.removeItem('conselhoIntermediarioAtivo');
                    if (conselhoId === idArmazenado) setConselhoId(null);
                }

                const resposta = await fetch(`${API}/ativo/${encodeURIComponent('Intermediário')}/${idUsuario}?semestre=${ciclo.semestre}&ano=${ciclo.ano}`);
                const dados = await resposta.json();

                if (dados?.sucesso && dados.conselho?.idConselho) {
                    const cid = dados.conselho.idConselho;
                    const vinculada = await turmaEstaVinculadaAoConselho(cid, idTurma);
                    if (vinculada) {
                        setConselhoId(cid);
                        localStorage.setItem('conselhoIntermediarioAtivo', String(cid));
                        setTurmaVinculadaAoConselho(true);
                        const avaliacao = await recarregarConselho(cid, idTurma);
                        if (!avaliacao) setIsModalTurmaOpen(true);
                    }
                }
            } catch (err) {
                console.error('Erro ao validar conselho existente:', err);
            } finally {
                setConselhoVerificado(true);
            }
        };

        validarConselhoExistente();
    }, [conselhoVerificado, conselhoId, idUsuario, idTurma, ciclo.semestre, ciclo.ano, recarregarConselho, turmaEstaVinculadaAoConselho]);

    // 2) Ao trocar de turma, se já existe conselho ativo, vincula a turma a ele
    useEffect(() => {
        if (!idTurma || !conselhoId || !conselhoVerificado || turmaVinculadaAoConselho) return;
        fetch(`${API}/iniciar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idTurma, conselhoId })
        })
          .then(() => {
            setTurmaVinculadaAoConselho(true);
            return recarregarConselho(conselhoId, idTurma);
          })
          .then(avaliacao => {
            if (!avaliacao) setIsModalTurmaOpen(true);  
          })
          .catch(err => console.error('Erro ao adicionar turma ao conselho:', err));
        setAlunosSelecionados([]);

    }, [idTurma, conselhoId, recarregarConselho, conselhoVerificado, turmaVinculadaAoConselho]);


    // Iniciar / Finalizar conselho
    const handleIniciarConselho = async () => {
        if (!idTurma || !idUsuario) {
            alert('Selecione uma turma e faça login para iniciar o conselho.');
            return;
        }
        setCarregandoConselho(true);
        try {
            const resp = await fetch(`${API}/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                tipoConselho: 'Intermediário',
                idTurma,
                idUsuario,
                semestre: ciclo.semestre,
                ano: ciclo.ano
                })
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.mensagem);
            setConselhoId(dados.conselhoId);
            setConselhoVerificado(true);
            setTurmaVinculadaAoConselho(true);
            localStorage.setItem('conselhoIntermediarioAtivo', String(dados.conselhoId));
            const avaliacao = await recarregarConselho(dados.conselhoId, idTurma);

            if (!avaliacao) {
              setIsModalTurmaOpen(true); // auto-abre se ainda não tem avaliação da turma
            }

        } catch (e) {
            console.error(e);
            alert('Erro ao iniciar conselho.');
        } finally {
            setCarregandoConselho(false);
        }
    };  

    const handleFinalizarConselho = async () => {
        if (!conselhoId) return;
        if (!confirm('Tem certeza que deseja finalizar o conselho?')) return;
        setCarregandoConselho(true);

        try {
            const resp = await fetch(`${API}/finalizar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conselhoId })
            });
            
            const dados = await resp.json();


            if (!dados.sucesso) throw new Error(dados.mensagem);
            localStorage.removeItem('conselhoIntermediarioAtivo');
            setConselhoId(null);
            setAvaliacaoTurma(null);
            setAlunosAvaliados({});
            alert('Conselho finalizado com sucesso!');
            navigate('/dashboard')

        } catch (e) {
            console.error(e);
            alert('Erro ao finalizar conselho.');
        } finally {
            setCarregandoConselho(false);
        }
    };
    
    // =====================================================================
    // SELEÇÃO DE ALUNOS (checkboxes da lista)
    // =====================================================================

    const handleToogleAluno = (id) => {
        setAlunosSelecionados(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleSelecionarTudo = (e) => {
        setAlunosSelecionados(e.target.checked ? alunos.map(a => a.idtblAluno) : []);
    };

    const handleLimparSelecao = () => setAlunosSelecionados([]);

    // =====================================================================
    // CALLBACKS DE "SALVO" DOS MODAIS
    // =====================================================================
    // Quando o modal da turma salva, fecha e recarrega os dados.
    // Isso fará com que turmaJaAvaliada vire true e libere o botão de alunos.

    const onSalvarAvaliacaoTurma = async () => {
        setIsModalTurmaOpen(false);
        await recarregarConselho(conselhoId, idTurma);
    };

    const onSalvarAvaliacaoAlunos = async () => {
        setIsModalAlunosOpen(false);
        setAlunosSelecionados([]);
        await recarregarConselho(conselhoId, idTurma);
    };

    const totalRestritos = Object.keys(alunosAvaliados).length;


  return (
      <section>
        <nav className="mb-4">
        <span className="text-sm text-gray-500">
          <button
            className="hover:underline text-gray-500"
          >
            Conselhos
          </button>
          {' / '}
          <span className="font-lg text-gray-700">Conselho Intermediário / {nomeTurma}</span>

        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] my-5 gap-5">
        <div className="flex min-h-[5vh]  justify-around align-center ">
          <div className={`${cardInfo} bg-[#FEFEFE] border border-black`}>
            <div className={`${cardText}`}>
              <h3 className={`${cardNum} text-2xl`}>{alunos.length}</h3>
              <p>Total de Alunos</p>
            </div>
            <div className={`${cardIcon}`}>
              <img src={totalAlunosIcon} alt="" className="w-10"/>
            </div>
          </div>
          <div className={`${cardInfo} bg-green-50 border-green-600`}>
            <div className={`${cardText} text-green-600`}>
              <h3 className={`${cardNum}`}>{Math.max(0, alunos.length - totalRestritos)}</h3>
              <p>Situação Normal</p>
            </div>
            <div className={`${cardIcon}`}>
              <img src={situacaoNormalIcon} alt="" className="w-10" />
            </div>
          </div>
          <div className={`${cardInfo} bg-yellow-50 border border-yellow-600`}>
            <div className={`${cardText} text-yellow-600`}>
              <h3 className={`${cardNum}`}>{totalRestritos}</h3>
              <p>Total Observações</p>
            </div>
            <div className={`${cardIcon}`}>
              <img src={restritosIcon} alt="" className="w-10"/>
            </div>
          </div>
          <div className={`${cardInfo} bg-red-50 border border-red-600`}>
            <div className={`${cardText} text-red-600`}>
              <h3 className={`${cardNum}`}>{totalRestritos}</h3>
              <p>Alunos Restritos</p>
            </div>
            <div className={`${cardIcon}`}>
              <img src={retidosIcon} alt="" className="w-10"/>
            </div>
          </div>

          <div className="card_avaliacoes">
            <div className="flex flex-col gap-3 mr-5 min-h-[220px]">
                <button
                  onClick={conselhoAtivo ? handleFinalizarConselho : handleIniciarConselho}
                  disabled={botaoPrincipalDesabilitado}
                  className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 font-bold text-lg
                  ${botaoPrincipalDesabilitado
                      ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                      : conselhoAtivo
                          ? 'bg-red-900 text-white cursor-pointer active:scale-95 hover:bg-red-700'
                          : 'bg-green-600 text-white cursor-pointer active:scale-95 hover:bg-green-700'}`}>
                  {carregandoConselho
                      ? 'Carregando...'
                      : conselhoAtivo ? 'Finalizar Conselho' : 'Iniciar Conselho'}
              </button>

                <button
                  onClick={handleOpenModalTurma}
                  disabled={!conselhoAtivo || turmaJaAvaliada}
                  title={turmaJaAvaliada ? 'Avaliação da turma já foi registrada' : ''}
                  className={`avaliar_toda_turma p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                  ${(!conselhoAtivo || turmaJaAvaliada)
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                  {turmaJaAvaliada ? 'Avaliação da Turma Salva' : 'Avaliar Toda Turma'}
              </button>

              <button
                onClick={handleLimparSelecao}
                disabled={botoesDesabilitados}
                className={`limpar_selecao p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                Limpar Seleção
              </button>

              <button
                onClick={handleOpenModalAlunos}
                disabled={!podeAvaliarAlunos}
                title={
                    !conselhoAtivo
                        ? 'Inicie o conselho para avaliar alunos'
                        : !turmaJaAvaliada
                            ? 'Avalie a turma antes de avaliar alunos'
                            : alunosSelecionados.length === 0
                                ? 'Selecione ao menos um aluno'
                                : ''
                }
                className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                ${!podeAvaliarAlunos
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                    : 'bg-red-600 text-white cursor-pointer active:scale-95'}`}>
                Avaliar Selecionados
            </button>
          </div>

          <ModalAvaliacaoTurma
              isOpen={isModalTurmaOpen}
              onClose={handleCloseModalTurma}
              conselhoId={conselhoId}
              idTurma={idTurma}
              nomeTurma={nomeTurma}
              avaliacaoExistente={avaliacaoTurma}
              onSaved={onSalvarAvaliacaoTurma}
          />
          <ModalAvaliacaoAlunos
              isOpen={isModalAlunosOpen}
              onClose={handleCloseModalAlunos}
              conselhoId={conselhoId}
              idUsuario={idUsuario}
              alunosSelecionados={alunosSelecionados.map(id => ({
                  id,
                  nome: alunos.find(a => a.idtblAluno === id)?.nome,
                  avaliacaoExistente: alunosAvaliados[id] || null
              }))}
              onSaved={onSalvarAvaliacaoAlunos}
          />
              </div>
            </div>
            
            <div className="flex flex-col mx-2 mr-6">
                <div className="flex justify-between my-0 mx-[10px] text-xl ">
                    <div className="flex gap-2">
                        <input disabled={botoesDesabilitados} type="checkbox" id="checkbox_selecionar_tudo" className="w-5 h-5 cursor-pointer" 
                        onChange={handleSelecionarTudo} checked={alunos.length > 0 && alunosSelecionados.length === alunos.length}/>
                        <p>Selecionar Tudo</p>
                    </div>
                    <div className="quatidade_alunos_selecionados">
                        <p>Alunos Selecionados: {alunosSelecionados.length}</p>
                    </div>
                </div>
                <div className="overflow-y-auto
                                [&::-webkit-scrollbar]:w-2
                                [&::-webkit-scrollbar-track]:bg-[#f1f1f1]
                                [&::-webkit-scrollbar-track]:rounded-full
                                [&::-webkit-scrollbar-track]:m-[5px]
                                [&::-webkit-scrollbar-thumb]:bg-[#888]
                                [&::-webkit-scrollbar-thumb]:rounded-full
                                [&::-webkit-scrollbar-thumb:hover]:bg-[#555]
                                ">
                {carregando && (
                    <p className="text-center text-gray-500 py-4">Carregando alunos...</p>
                )}
                    
                    
                <div className="p-5 w-[98.5%] bg-[#FEFEFE] border border-black rounded-[10px] box-border m-[10px] h-[50vh] overflow-y-auto overflow-x-hidden pr-[5px] shadow-[0_0_2px_black]">
                {!carregando && alunos.map((aluno) => {
                    const restrito = !!alunosAvaliados[aluno.idtblAluno];
                    return (
                    <div key={aluno.idtblAluno}>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                            disabled={botoesDesabilitados}
                            type="checkbox"
                            className='w-5 h-5 cursor-pointer'
                            checked={alunosSelecionados.includes(aluno.idtblAluno)}
                            onChange={() => handleToogleAluno(aluno.idtblAluno)}
                            />
                            <p className="text-xl">{aluno.nome}</p>
                            <button className='text-gray-500 text-xs mt-[5px] hover:underline'>
                            <div className="flex items-center my-0 mx-1 gap-1">
                                <img src={notificationIcon} alt="" className="w-6 h-6 border border-yellow-600 rounded-full p-[1px]"/>
                                <div className='flex'>
                                <p className="text-m underline">Ver Observações</p>
                                    </div>
                                </div>
                        </button>
                      </div>
                      <div className="div_btn_restrito">
                        {restrito && (
                          <button className="bg-gray-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] w-[150px] p-1 text-xl rounded-[20px] mr-4 active:scale-95">
                            Restrito
                          </button>
                        )}
                      </div>
                    </div>
                    <hr className='my-[10px] mx-0' />
                  </div>
                );
              })}
            </div>

            {!carregando && idTurma && alunos.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum aluno encontrado nessa turma.
              </p>
            )}
          </div>
        </div>
             
                
        </div>
      </section>
      
  );
}