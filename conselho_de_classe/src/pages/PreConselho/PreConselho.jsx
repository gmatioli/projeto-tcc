import React, { useState,  useEffect, useCallback  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import totalAlunosIcon from '../../assets/pre-conselho/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/pre-conselho/situacao-normal-icon.svg'
import restritosIcon from '../../assets/pre-conselho/restritos-icon.svg'
import retidosIcon from '../../assets/pre-conselho/retidos-icon.svg'
import notificationIcon from '../../assets/pre-conselho/notification-icon.svg'

import ModalAvaliacao from '../../components/modalAvaliacaoPreConselho/ModalAvaliacao';

import { API } from '../../config/api';

// Calcula semestre/ano corrente (mês <= 6 => 1º semestre)
const cicloAtual = () => {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;       
//   const mes = 8;
  return {
    ano: hoje.getFullYear(),
    semestre: mes <= 6 ? 1 : 2
  };
};
const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";

export function PreConselho() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idTurma = searchParams.get('turma');
    const nomeTurma = searchParams.get('nomeTurma');
    const nomeEmpresa = searchParams.get('');


    // Usuário logado vindo do localStorage (para registrar quem iniciou)
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    const idUsuario = usuario.idUsuario;
    
    const [conselhoId, setConselhoId] = useState(() => {
            const v = localStorage.getItem('preConselhoAtivo');
            return v ? Number(v) : null;
        });
    
    const [modoEdicao, setModoEdicao] = useState(false);
        
    // Ciclo (semestre/ano) corrente — usado para reusar/abrir conselho no mesmo período
    const ciclo = useState(cicloAtual)[0];
    const [alunos, setAlunos] = useState([]);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [carregandoConselho, setCarregandoConselho] = useState(false); 
    const [alunosAvaliados, setAlunosAvaliados] = useState({}); 
     // Avaliações vindas do Conselho Intermediário do MESMO ciclo (histórico)
    const [historicoIntermediario, setHistoricoIntermediario] = useState({});       
    const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

    // Estado que controla se o modal está aberto ou não
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Existe um conselho rodando?
    const conselhoAtivo = !!conselhoId;

    // Regras de habilitação (centralizadas aqui pra ficar fácil de manter):
    //  - botoesDesabilitados: bloqueia tudo enquanto o conselho não for iniciado
    //  - podeAvaliarAlunos: precisa ter conselho +  alunos marcados
    const botoesDesabilitados = !modoEdicao;
    
    const podeAvaliarAlunos =
        modoEdicao && alunosSelecionados.length > 0;

    // O botão principal (Iniciar/Finalizar) só fica bloqueado se está
    // carregando OU se não tem turma/usuário para iniciar
    const botaoPrincipalDesabilitado =
        carregandoConselho || aguardandoConfirmacao ||(!conselhoAtivo && (!idTurma || !idUsuario));

    const textoBotaoPrincipal = carregandoConselho
    ? 'Carregando...'
    : modoEdicao
        ? 'Finalizar Conselho'
        : conselhoAtivo
            ? 'Editar Conselho'
            : 'Iniciar Conselho';    



    // Funções para manipular o estado
    const handleOpenModal = () => {
        if (!podeAvaliarAlunos) return; 
        setIsModalOpen(true);
    }


    const handleCloseModal = () => setIsModalOpen(false);

    const recarregarConselho = useCallback(async (cid, tid) => {
        if (!cid || !tid) return;
        try {
            const respA = await fetch(`${API.conselho}/${cid}/turma/${tid}/avaliacoes-alunos`).then(r => r.json());

            const mapa = {};
            (respA?.avaliacoes || []).forEach(a => {
                mapa[a.tblAluno_idtblAluno] = a;
            });
            setAlunosAvaliados(mapa);
        } catch (e) {
            console.error('Erro ao recarregar pré-conselho:', e);
        }
    }, []);


    useEffect(() => {
        if(!idTurma) return;
        setAlunosAvaliados({});
        setAlunosSelecionados([]);
        setHistoricoIntermediario({});
        setCarregando(true);
        fetch(`${API.alunos}/empresa/${idTurma}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) setAlunos(data.alunos);
            })
            .finally(() => setCarregando(false));
        // Busca histórico do Conselho Intermediário do MESMO ciclo (semestre+ano)
        // Marca como "Restrito" no Pré-Conselho os alunos que já tiveram restrição no Intermediário.
        fetch(`${API.conselho}/historico-intermediario/turma/${idTurma}?semestre=${ciclo.semestre}&ano=${ciclo.ano}`)
            .then(res => res.json())
            .then(data => {
                if (!data?.sucesso) return;
                const mapa = {};
                (data.avaliacoes || []).forEach(a => {
                    mapa[a.tblAluno_idtblAluno] = a;
                });
                setHistoricoIntermediario(mapa);
            })
            .catch(err => console.error('Erro ao buscar histórico do intermediário:', err));
    }, [idTurma, ciclo.semestre, ciclo.ano]);

    // 1b) Ao montar: se não há conselho em localStorage, busca um do ciclo atual.
    useEffect(() => {
        if (conselhoId || !idUsuario) return;
        fetch(`${API.conselho}/ativo/${encodeURIComponent('Pré-Conselho')}/${idUsuario}?semestre=${ciclo.semestre}&ano=${ciclo.ano}`)
            .then(r => r.json())
            .then(d => {
                if (d?.sucesso && d.conselho?.idConselho) {
                    setConselhoId(d.conselho.idConselho);
                    localStorage.setItem('preConselhoAtivo', String(d.conselho.idConselho));
                }
            })
            .catch(err => console.error('Erro ao buscar pré-conselho ativo do ciclo:', err));
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

            .catch(err => console.error('Erro ao adicionar turma ao conselho:', err));
        setAlunosSelecionados([]);

    }, [idTurma, conselhoId, recarregarConselho]);

    // Iniciar / Finalizar conselho
    const handleIniciarConselho = async () => {
        if (!idTurma || !idUsuario) {
            alert('Selecione uma turma e faça login para iniciar o conselho.');
            return;
        }
        setCarregandoConselho(true);
        try {
            const resp = await fetch(`${API.conselho}/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                tipoConselho: 'Pré-Conselho',
                idTurma,
                idUsuario,
                semestre: ciclo.semestre,
                ano: ciclo.ano
                })
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.mensagem);
            setConselhoId(dados.conselhoId);
            localStorage.setItem('preConselhoAtivo', String(dados.conselhoId));
            setModoEdicao(true);


        } catch (e) {
            console.error(e);
            alert('Erro ao iniciar conselho.');
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
                    tipoConselho: 'Pré-Conselho',
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
                localStorage.setItem('preConselhoAtivo', String(idFinal));
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
            localStorage.removeItem('preConselhoAtivo');
            setConselhoId(null);
            setModoEdicao(false);
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

    const handleToogleAluno = (id) => {
        setAlunosSelecionados(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleSelecionarTudo = (e) => {
        if (e.target.checked) {
        setAlunosSelecionados(alunos.map(a => a.idtblAluno));
        } else {
        setAlunosSelecionados([]);
        }
    };

    const handleLimparSelecao = () => setAlunosSelecionados([]);

    const onSalvarAvaliacaoAlunos = async () => {
        setIsModalOpen(false);
        setAlunosSelecionados([]);
        await recarregarConselho(conselhoId, idTurma);
    };

    // const totalRestritos = Object.keys(alunosAvaliados).length;

    // Aluno é considerado "restrito" no Pré-Conselho se já tem avaliação aqui
    // OU se tinha avaliação no Conselho Intermediário do mesmo ciclo.
    const idsRestritos = new Set([
        ...Object.keys(alunosAvaliados),
        ...Object.keys(historicoIntermediario)
    ]);
    const totalRestritos = idsRestritos.size;

    const tableThClasses = "border border-[#ddd] p-[12px_15px] text-left font-bold bg-white";
    const tableTdClasses = "border border-[#ddd] p-[12px_15px] text-left text-lg";

    // Classes do botão principal baseadas no estado atual
    const classeBotaoPrincipal = botaoPrincipalDesabilitado
        ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
        : modoEdicao
            ? 'bg-red-900 text-white cursor-pointer active:scale-95 hover:bg-red-700'
            : conselhoAtivo
                ? 'bg-red-700 text-white cursor-pointer active:scale-95 hover:bg-red-800'
                : 'bg-green-600 text-white cursor-pointer active:scale-95 hover:bg-green-700';
 
  return (
      <section>
      <nav className="mb-4">
        <span className="text-sm text-gray-500">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Conselhos
          </button>
          {' / '}
          <span className="font-medium text-gray-700">Pré-Conselho / {nomeTurma}</span>
        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] my-5 ">
            <div className="flex justify-around">
                <div className={`${cardInfo} bg-[#FEFEFE] border border-black`}>
                    <div className={`${cardText}`}>
                        <h3 className={`${cardNum} text-2xl`}>{alunos.length}</h3>
                        <p className="text_total_alunos">Total de Alunos</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={totalAlunosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className={`${cardInfo} bg-green-50 border-green-600`}>
                    <div className={`${cardText} text-green-600`}>
                        <h3 className={`${cardNum}`}>{Math.max(0, alunos.length - totalRestritos)}</h3>
                        <p className="text_situacao_normal">Situação Normal</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={situacaoNormalIcon} alt=""className="w-10" />
                    </div>
                </div>
                <div className={`${cardInfo} bg-yellow-50 border border-yellow-600`}>
                    <div className={`${cardText} text-yellow-600`}>
                        <h3 className={`${cardNum}`}>{totalRestritos}</h3>
                        <p className="text_restritos">Total Observações</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={restritosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className={`${cardInfo} bg-red-50 border border-red-600`}>
                    <div className={`${cardText} text-red-600`}>
                        <h3 className={`${cardNum}`}>{totalRestritos}</h3>
                        <p className="text_retidos">Alunos Restritos</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={retidosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className="card_avaliacoes">
            <div className="flex flex-col gap-7 min-h-[220px]">
                <button
                  onClick={handleAcaoBotaoPrincipal}
                  disabled={botaoPrincipalDesabilitado}
                  className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 font-bold text-lg
                  ${classeBotaoPrincipal}`}>
                  {textoBotaoPrincipal}
              </button>

                <button onClick={handleLimparSelecao}  disabled={botoesDesabilitados}  className={`limpar_selecao p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 
                    ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                    Limpar Seleção
                </button>
                <button
                onClick={handleOpenModal}
                disabled={!podeAvaliarAlunos}
                title={
                    !conselhoAtivo || !modoEdicao
                        ? 'Inicie o conselho para avaliar alunos'
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
                {/* Renderiza o Modal passando o estado e a função de fechar */}
                <ModalAvaliacao 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                conselhoId={conselhoId}
                idUsuario={idUsuario}
                alunosSelecionados={alunosSelecionados.map(id => ({
                    id,
                    nome: alunos.find(a => a.idtblAluno === id)?.nome,
                    avaliacaoExistente: alunosAvaliados[id] || null,
                    historicoIntermediario: historicoIntermediario[id] || null
                }))}
                onSaved={onSalvarAvaliacaoAlunos} />
                </div>
            </div>
        </div>
        
            <div className="flex flex-col mx-2 mr-6 ">
                <div className="flex justify-between my-0 mx-[10px] text-xl ">
                    <div className="flex gap-2">
                        <input onChange={handleSelecionarTudo} disabled={botoesDesabilitados} type="checkbox" id="checkbox_selecionar_tudo" className="w-5 h-5 cursor-pointer"
                        checked={alunos.length > 0 && alunosSelecionados.length === alunos.length} />
                        <p>Selecionar Tudo</p>
                    </div>
                    <div className="quatidade_alunos_selecionados">
                        <p>Alunos Selecionados: {alunosSelecionados.length}</p>
                    </div>
                </div>

                <section className='h-[54vh] overflow-y-auto border border-gray-200 rounded-md'>
                    {!carregando && (
                        
                    <table className="w-full bg-[#FEFEFE] box-border border-separate border-spacing-0 shadow-[0_0_4px_gray]">
                        <thead>
                        <tr>
                            <th className={`${tableThClasses} w-[44%] sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb] p-2 text-left font-bold border-separate border-spacing-0 `}>Aluno</th>
                            <th className={`${tableThClasses} w-[12%] text-center sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb] p-2 text-left font-bold border-separate border-spacing-0`}>Observações</th>
                            <th className={`${tableThClasses} w-[20%] text-center sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb] p-2 text-left font-bold border-separate border-spacing-0`}>Empresa</th>
                            <th className={`${tableThClasses} w-[14%] text-center sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb] p-2 text-left font-bold border-separate border-spacing-0`}>1° Conselho</th>
                            <th className={`${tableThClasses} w-[10%] text-center sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e7eb] p-2 text-left font-bold border-separate border-spacing-0`}>2° Conselho</th>
                        </tr>
                        </thead>
                    
                        <tbody>
                        {/* O map fica AQUI, apenas para gerar as linhas (tr) da tabela */}
                        {alunos.map((aluno) => {
                            const restritoAtual= !!alunosAvaliados[aluno.idtblAluno];
                            const restritoHistorico = !!historicoIntermediario[aluno.idtblAluno];
                            const restrito = restritoAtual;
                    
                            return (
                            <tr key={aluno.idtblAluno}>
                    
                                {/* Coluna 1: Aluno */}
                                <td className={`${tableTdClasses}`}>
                                <label className='flex items-center gap-2 m-0 cursor-pointer'>
                                    <input
                                    disabled={botoesDesabilitados}
                                    type="checkbox"
                                    className='w-5 h-5 cursor-pointer'
                                    checked={alunosSelecionados.includes(aluno.idtblAluno)}
                                    onChange={() => handleToogleAluno(aluno.idtblAluno)}
                                    />
                                    <p className="text-xl">{aluno.nome}</p>
                                </label>
                                </td>
                                {/* Coluna 2: Observações */}
                                <td className={`${tableTdClasses}`}>
                                <button className='text-gray-500 text-xs mt-[5px] hover:underline'>
                                <div className="flex items-center my-0 mx-1 gap-1">
                                    <img src={notificationIcon} alt="" className="w-6 h-6 p-[1px]"/>
                                    <div className='flex'>
                                    <p className="text-m underline text-orange-700">Ver Observações</p>
                                        </div>
                                    </div>
                                </button>
                                </td>
                                {/* Coluna 3: Empresa */}
                                <td className={`${tableTdClasses}`}>
                                    <p className="text-xl text-center">{aluno.nomeEmpresa || "-"}</p>

                                </td>

                                {/* Coluna 4: Restrito - C.I */}
                                <td className={`${tableTdClasses} text-center`}>
                                    <div className="div_label_restrito_ci">
                                        {restritoHistorico && (
                                        <label className="text-lg text-white font-bold bg-red-800 px-4 py-2 rounded-full">
                                            Restrito
                                        </label>
                                        )}
                                    </div>
                                </td>

                                {/* Coluna 5: Restrito */}
                                <td className={`${tableTdClasses} text-center`}>
                                <div className="div_btn_restrito">
                                    {restrito && (
                                    <label className="text-lg text-white font-bold bg-red-800 px-4 py-2 rounded-full">
                                        Restrito
                                    </label>
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
            </div>
      </section>
      
  );
}