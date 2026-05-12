import React, { useState,  useEffect, useCallback  } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'

import totalAlunosIcon from '../../assets/pre-conselho/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/pre-conselho/situacao-normal-icon.svg'
import restritosIcon from '../../assets/pre-conselho/restritos-icon.svg'
import retidosIcon from '../../assets/pre-conselho/retidos-icon.svg'
import notificationIcon from '../../assets/pre-conselho/notification-icon.svg'

import ModalAvaliacao from '../../components/modalAvaliacaoPreConselho/ModalAvaliacao';

const API = 'http://localhost:3001/api/conselho';

const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";

export function PreConselho() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idTurma = searchParams.get('turma');
    const nomeTurma = searchParams.get('nomeTurma');

    // Usuário logado vindo do localStorage (para registrar quem iniciou)
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    const idUsuario = usuario.idUsuario;
    
    const [conselhoId, setConselhoId] = useState(() => {
            const v = localStorage.getItem('preConselhoAtivo');
            return v ? Number(v) : null;
        });

    const [alunos, setAlunos] = useState([]);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [carregandoConselho, setCarregandoConselho] = useState(false); 
    const [alunosAvaliados, setAlunosAvaliados] = useState({});        

    // Estado que controla se o modal está aberto ou não
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Existe um conselho rodando?
    const conselhoAtivo = !!conselhoId;

    // Regras de habilitação (centralizadas aqui pra ficar fácil de manter):
    //  - botoesDesabilitados: bloqueia tudo enquanto o conselho não for iniciado
    //  - podeAvaliarAlunos: precisa ter conselho +  alunos marcados
    const botoesDesabilitados = !conselhoAtivo;
    const podeAvaliarAlunos =
        conselhoAtivo && alunosSelecionados.length > 0;

    // O botão principal (Iniciar/Finalizar) só fica bloqueado se está
    // carregando OU se não tem turma/usuário para iniciar
    const botaoPrincipalDesabilitado =
        carregandoConselho || (!conselhoAtivo && (!idTurma || !idUsuario));


    // Funções para manipular o estado
    const handleOpenModal = () => {
        if (!podeAvaliarAlunos) return; 
        setIsModalOpen(true);
    }


    const handleCloseModal = () => setIsModalOpen(false);

    const recarregarConselho = useCallback(async (cid, tid) => {
        if (!cid || !tid) return;
        try {
            const respA = await fetch(`${API}/${cid}/turma/${tid}/avaliacoes-alunos`).then(r => r.json());

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

        setCarregando(true);
        fetch(`http://localhost:3001/api/alunos/${idTurma}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) setAlunos(data.alunos);
            })
            .finally(() => setCarregando(false));
    }, [idTurma]);

     // 2) Ao trocar de turma, se já existe conselho ativo, vincula a turma a ele
    useEffect(() => {
        if (!idTurma || !conselhoId) return;
        fetch(`${API}/iniciar`, {
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
            const resp = await fetch(`${API}/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                tipoConselho: 'Pré-Conselho',
                idTurma,
                idUsuario
                })
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.mensagem);
            setConselhoId(dados.conselhoId);
            localStorage.setItem('preConselhoAtivo', String(dados.conselhoId));
            const avaliacao = await recarregarConselho(dados.conselhoId, idTurma);

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
            localStorage.removeItem('preConselhoAtivo');
            setConselhoId(null);
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

    const totalRestritos = Object.keys(alunosAvaliados).length;

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

                <button onClick={handleLimparSelecao}  disabled={botoesDesabilitados}  className={`limpar_selecao p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 
                    ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                    Limpar Seleção
                </button>
                <button
                onClick={handleOpenModal}
                disabled={!podeAvaliarAlunos}
                title={
                    !conselhoAtivo
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
                    avaliacaoExistente: alunosAvaliados[id] || null
                }))}
                onSaved={onSalvarAvaliacaoAlunos} />
                </div>
            </div>
        </div>
        
            <div className="flex flex-col mx-2 mr-6 ">
                <div className="flex justify-between my-0 mx-[10px] text-xl ">
                    <div className="flex gap-2">
                        <input disabled={botoesDesabilitados} type="checkbox" id="checkbox_selecionar_tudo" className="w-5 h-5 cursor-pointer" />
                        <p>Selecionar Tudo</p>
                    </div>
                    <div className="quatidade_alunos_selecionados">
                        <p>Alunos Selecionados: 0</p>
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

                    <div className="p-5 w-[98.5%] bg-[#FEFEFE] border border-black rounded-[10px] box-border m-[10px] h-[50vh] overflow-y-auto overflow overflow-x-hidden pr-[5px] shadow-[0_0_2px_black]">
                            
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
                </div>
                
            </div>
      </section>
      
  );
}