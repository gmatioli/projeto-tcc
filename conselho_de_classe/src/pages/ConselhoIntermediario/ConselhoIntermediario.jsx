import React, { useState,  useEffect, useCallback  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

import ModalAvaliacaoAlunos from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoAlunos';
import ModalAvaliacaoTurma from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoTurma';

import { API } from '../../config/api';

// Calcula semestre/ano corrente (mês <= 6 => 1º semestre)
const cicloAtual = () => {
  const hoje = new Date();
  return {
    ano: hoje.getFullYear(),
    semestre: hoje.getMonth() + 1 <= 6 ? 1 : 2
  };
};

  const cardInfo = "flex flex-col justify-between border-2 rounded-[15px] min-h-[22vh] w-[12vw] mx-[1.5vh] shadow-[2px_2px_8px_gray]";
  const cardNum = "text-3xl italic";
  const cardText = "mt-[4vh] mx-[1vw] text-xl font-bold";
  const cardIcon = "flex items-end justify-end m-[0_1vh_1vh_0]";
  

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
  
    const [modoEdicao, setModoEdicao] = useState(false);

    // Ciclo (semestre/ano) corrente — usado para reusar/abrir conselho no mesmo período
    const ciclo = useState(cicloAtual)[0];
    const [alunos, setAlunos] = useState([]);                          // lista de alunos da turma atual
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);  // IDs marcados nos checkboxes
    const [carregando, setCarregando] = useState(false);               // loading da lista de alunos
    const [carregandoConselho, setCarregandoConselho] = useState(false); // loading dos botões iniciar/finalizar
    const [avaliacaoTurma, setAvaliacaoTurma] = useState(null);        // avaliação da turma (null se ainda não foi feita)
    const [alunosAvaliados, setAlunosAvaliados] = useState({});        // mapa { idAluno: avaliacao }
    const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

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
    const botoesDesabilitados = !modoEdicao 
    // && !conselhoAtivo; // modoEdição libera os botões mesmo sem conselho, para permitir edição posterior

    const podeAvaliarAlunos =
       modoEdicao  && turmaJaAvaliada && alunosSelecionados.length > 0;

     // O botão principal (Iniciar/Finalizar) só fica bloqueado se está
    // carregando OU se não tem turma/usuário para iniciar
   

    const textoBotaoPrincipal = carregandoConselho
        ? 'Carregando...'
        : modoEdicao
            ? 'Finalizar Conselho'
            : conselhoAtivo
                ? 'Editar Conselho'
                : 'Iniciar Conselho';

    const textoBotaoAvaliar = !modoEdicao
    ? (conselhoAtivo ? 'Clique em Editar Conselho' : 'Inicie o conselho')
    : !turmaJaAvaliada
      ? 'Avalie a turma primeiro'
      : alunosSelecionados.length === 0
        ? 'Selecione ao menos um aluno'
        : 'Avaliar Selecionado(s)';

    // =====================================================================
    // CONTROLE DOS MODAIS
    // =====================================================================
    // Modal da TURMA: só abre se há conselho ativo
    // (Serve tanto para CRIAR a primeira avaliação quanto para EDITAR a existente)
    const handleOpenModalTurma = () => {
        if (!modoEdicao || !conselhoAtivo) return; // proteção contra cliques indevidos
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
              fetch(`${API.conselho}/${cid}/avaliacao-turma/${tid}`).then(r => r.json()),
              fetch(`${API.conselho}/${cid}/turma/${tid}/avaliacoes-alunos`).then(r => r.json()),
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

      // 1) Carrega alunos da turma sempre que a turma muda
    useEffect(() => {
        if(!idTurma) return;
        setAlunosAvaliados({});
        setAlunosSelecionados([]);

        setCarregando(true);
        fetch(`${API.alunos}/empresa/${idTurma}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) setAlunos(data.alunos);
            })
            .finally(() => setCarregando(false));
    }, [idTurma]);

    // 1b) Ao montar: se não há conselho em localStorage, busca um do ciclo atual.
    // Permite retomar/editar conselho finalizado do mesmo semestre (ex: aluno esquecido).


    useEffect(() => {
        if (conselhoId || !idUsuario) return;
        fetch(`${API.conselho}/ativo/${encodeURIComponent('Intermediário')}/${idUsuario}?semestre=${ciclo.semestre}&ano=${ciclo.ano}`)
            .then(r => r.json())
            .then(d => {
                if (d?.sucesso && d.conselho?.idConselho) {
                    setConselhoId(d.conselho.idConselho);
                    localStorage.setItem('conselhoIntermediarioAtivo', String(d.conselho.idConselho));
                }
            })
            .catch(err => console.error('Erro ao buscar conselho ativo do ciclo:', err));
    }, [conselhoId, idUsuario, ciclo.semestre, ciclo.ano]);

    // 2) Ao trocar de turma, se já existe conselho ativo, vincula a turma a ele
    useEffect(() => {
        if (!idTurma || !conselhoId) return;
        fetch(`${API.conselho}/iniciar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idTurma, conselhoId })
        })
          .then(() => recarregarConselho(conselhoId, idTurma))
          .then(avaliacao => {
            if (!avaliacao && modoEdicao) setIsModalTurmaOpen(true);  
          })
          .catch(err => console.error('Erro ao adicionar turma ao conselho:', err));
        setAlunosSelecionados([]);

    }, [idTurma, conselhoId, recarregarConselho, modoEdicao]);


    // Iniciar / Finalizar conselho
    const handleIniciarConselho = async () => {
        if (!idTurma || !idUsuario) {
            toast.warning('Selecione uma turma e faça login para iniciar o conselho.');
            return;
        }
        setCarregandoConselho(true);
        try {
            const resp = await fetch(`${API.conselho}/iniciar`, {
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
            localStorage.setItem('conselhoIntermediarioAtivo', String(dados.conselhoId));
            const avaliacao = await recarregarConselho(dados.conselhoId, idTurma);
            setModoEdicao(true);

            if (!avaliacao) {
              setIsModalTurmaOpen(true); // auto-abre se ainda não tem avaliação da turma
            }

        } catch (e) {
            console.error(e);
            toast.error('Erro ao iniciar conselho.');
        } finally {
            setCarregandoConselho(false);
        }
    };  

     const handleEditarConselho = async () => {
        if (!conselhoId || !idTurma || !idUsuario) return;
        setCarregandoConselho(true);
        try {
            const resp = await fetch(`${API.conselho}/iniciar`, {
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
 
            // Garante consistência do ID local com o retorno do backend
            const idFinal = dados.conselhoId || conselhoId;
            if (idFinal !== conselhoId) {
                setConselhoId(idFinal);
                localStorage.setItem('conselhoIntermediarioAtivo', String(idFinal));
            }
          
            await recarregarConselho(idFinal, idTurma);
            setModoEdicao(true);
 
        } catch (e) {
            console.error(e);
            alert('Erro ao editar conselho.');
        } finally {
            setCarregandoConselho(false);
        }
    };

    const handleFinalizarConselho = async () => {
        if (!conselhoId) return;

        setAguardandoConfirmacao(true);

        toast('Deseja finalizar o conselho?', {
          action: {
              label: "FINALIZAR",
              onClick: () => executarFinalizacao(),
          },
          cancel: {
              label: "CANCELAR",
              onClick: () => setAguardandoConfirmacao(false),
          },
          onDismiss: () => setAguardandoConfirmacao(false),    // ← libera se fechar
          onAutoClose: () => setAguardandoConfirmacao(false),  // ← libera se expirar
          duration: 5000,

        });
      };

    const executarFinalizacao = async () => {
        setAguardandoConfirmacao(false);   
        setCarregandoConselho(true);

        try {
            const resp = await fetch(`${API.conselho}/finalizar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conselhoId })
            });
            
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.mensagem);

            localStorage.removeItem('conselhoIntermediarioAtivo');
            setConselhoId(null);
            setModoEdicao(false);
            setAvaliacaoTurma(null);
            setAlunosAvaliados({});
            toast.success('Conselho finalizado com sucesso!');
            navigate('/dashboard')

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
    
    // =====================================================================
    // SELEÇÃO DE ALUNOS (checkboxes da lista)
    // =====================================================================

    const handleToggleAluno = (id) => {
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

    const tableThClasses = "border-b-2 border-t-2 border-r-2 first:border-l-2 border-gray-400 p-[12px_15px] font-bold bg-white sticky top-0 z-10";
    const tableTdClasses = "border-b-2 border-r-2 first:border-l-2 border-gray-400 p-[12px_15px] text-lg";

    const botaoPrincipalDesabilitado = carregandoConselho || aguardandoConfirmacao || (!conselhoAtivo && (!idTurma || !idUsuario));

    // Classes do botão principal baseadas no estado atual
    const classeBotaoPrincipal = botaoPrincipalDesabilitado
        ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
        : modoEdicao
            ? 'bg-red-900 text-white cursor-pointer active:scale-95 hover:bg-red-700'
            : conselhoAtivo
                ? 'bg-red-700 text-white cursor-pointer active:scale-95 hover:bg-red-800'
                : 'bg-green-600 text-white cursor-pointer active:scale-95 hover:bg-green-700';
 

  return (
      <section className='flex flex-col h-auto h-[92vh] gap-[1vh] mx-[1vw]'>
        <nav className="my-[1vh]">
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
        <div className="flex flex-col min-w-[72vw] gap-[1vh]">
        <div className="flex justify-around align-center ">
          <div className={`${cardInfo} bg-gray-50 border-gray-800`}>
            <div className={`${cardText}`}>
              <h3 className={`${cardNum} `}>{alunos.length}</h3>
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
          <div className={`${cardInfo} bg-red-50 border border-[var(--red-senai)]`}>
            <div className={`${cardText} text-[var(--red-senai)]`}>
              <h3 className={`${cardNum}`}>{totalRestritos}</h3>
              <p>Alunos Restritos</p>
            </div>
            <div className={`${cardIcon}`}>
              <img src={retidosIcon} alt="" className="w-10"/>
            </div>
          </div>

          <div className="card_avaliacoes">
            <div className="flex flex-col gap-3 min-h-[25vh]">
                <button
                  onClick={handleAcaoBotaoPrincipal}
                  disabled={botaoPrincipalDesabilitado}
                  className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 font-bold text-lg ${classeBotaoPrincipal}`}>
                  {textoBotaoPrincipal}
              </button>

                <button
                  onClick={handleOpenModalTurma}
                  disabled={!modoEdicao}
                  title={
                      !modoEdicao
                          ? (conselhoAtivo
                              ? 'Clique em "Editar Conselho" para fazer alterações'
                              : 'Inicie o conselho primeiro')
                          : turmaJaAvaliada
                              ? 'Avaliação da turma já foi registrada'
                              : ''
                  }                  
                  className={`avaliar_toda_turma p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                  ${!modoEdicao
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
                className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                ${!podeAvaliarAlunos
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'  
                    : 'bg-red-600 text-white cursor-pointer active:scale-95'}`}>
              {textoBotaoAvaliar}
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
            
            <div className="flex flex-col">
                <div className="flex justify-between my-0 mx-[10px] text-xl my-[1vh]">
                    <div className="flex gap-2">
                        <input disabled={botoesDesabilitados} type="checkbox" id="checkbox_selecionar_tudo" className="w-5 h-5 cursor-pointer" 
                        onChange={handleSelecionarTudo} checked={alunos.length > 0 && alunosSelecionados.length === alunos.length}/>
                        <p>Selecionar Tudo</p>
                    </div>
                    <div className="quatidade_alunos_selecionados">
                        <p>Alunos Selecionados: {alunosSelecionados.length}</p>
                    </div>
                </div>
                <div>
                {carregando && (
                    <p className="text-center text-gray-500 py-4">Carregando alunos...</p>
                )}

                <section className='max-h-[50vh] overflow-y-auto '>
                {!carregando && (
                  <table className="w-full bg-white box-border border-separate border-spacing-0 shadow-[0_0_4px_gray]">
                    <thead>
                      <tr>
                        {/* Adicionado text-left aqui */}
                        <th className={`${tableThClasses} w-[58%] text-left`}>Aluno</th>
                        <th className={`${tableThClasses} w-[12%] text-center`}>Observações</th>
                        <th className={`${tableThClasses} w-[20%] text-center`}>Empresa</th>
                        <th className={`${tableThClasses} w-[10%] text-center`}>Restrição</th>
                      </tr>
                    </thead>
                
                    <tbody>
                      {alunos.map((aluno) => {
                        const restrito = !!alunosAvaliados[aluno.idtblAluno];
                
                        return (
                          <tr key={aluno.idtblAluno} className="hover:bg-gray-50 transition-colors">
                
                            {/* Coluna 1: Aluno */}
                            <td className={`${tableTdClasses} text-left`}>
                              <label className='flex items-center gap-3 m-0 cursor-pointer w-fit'>
                                <input
                                  disabled={botoesDesabilitados}
                                  type="checkbox"
                                  className='w-5 h-5 cursor-pointer flex-shrink-0'
                                  checked={alunosSelecionados.includes(aluno.idtblAluno)}
                                  onChange={() => handleToggleAluno(aluno.idtblAluno)}
                                />
                                <span className="text-xl">{aluno.nome}</span>
                              </label>
                            </td>

                            {/* Coluna 2: Observações */}
                            <td className={`${tableTdClasses} text-center`}>
                              <button className='flex flex-col items-center justify-center mx-auto text-gray-500 hover:opacity-80 transition-opacity'>
                                <img src={notificationIcon} alt="Notificações" className="w-5 h-5 mb-1" />
                                <span className="text-sm underline text-orange-700 whitespace-nowrap">
                                  Ver Observações
                                </span>
                              </button>
                            </td>

                            {/* Coluna 3: Empresa */}
                            <td className={`${tableTdClasses} text-center`}>
                                <p className="text-xl">{aluno.nomeEmpresa || "-"}</p>
                            </td>

                            {/* Coluna 4: Restrito */}
                            <td className={`${tableTdClasses} text-center`}>
                              <div className="flex justify-center">
                                {restrito && (
                                  <span className="text-sm text-white font-bold bg-red-800 px-3 py-1 rounded-full whitespace-nowrap">
                                    Restrito
                                  </span>
                                )}
                              </div>
                            </td>
                
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>

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