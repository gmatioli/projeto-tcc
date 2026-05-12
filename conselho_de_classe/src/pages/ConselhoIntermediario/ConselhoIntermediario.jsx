import React, { useState,  useEffect, useCallback  } from 'react';
import { useSearchParams } from 'react-router-dom'

import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

import ModalAvaliacaoAlunos from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoAlunos';
import ModalAvaliacaoTurma from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoTurma';

const API = 'http://localhost:3001/api/conselho';

const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";

const semestreCliente = () => {
    const d = new Date();
    return { semestre: d.getMonth() + 1 <= 6 ? 1 : 2, ano: d.getFullYear() };
};

export function ConselhoIntermediario() {
    const [searchParams] = useSearchParams();
    const idTurma = searchParams.get('turma');
    const nomeTurma = searchParams.get('nomeTurma');
    const modo = searchParams.get('modo');

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    const idUsuario = usuario.idUsuario;

    const [conselhoId, setConselhoId] = useState(null);

    const [alunos, setAlunos] = useState([]);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [carregandoConselho, setCarregandoConselho]   = useState(false);
    const [avaliacaoTurma, setAvaliacaoTurma]           = useState(null); 
    const [alunosAvaliados, setAlunosAvaliados]         = useState({});   

    // Estados independentes para controlar cada modal
    const [isModalTurmaOpen, setIsModalTurmaOpen] = useState(false);
    const [isModalAlunosOpen, setIsModalAlunosOpen] = useState(false);

    const conselhoAtivo = !!conselhoId;
    // Botões habilitados quando: estamos no modo iniciar OU já existe conselho em andamento
    const botoesDesabilitados = !conselhoAtivo && modo !== 'iniciar';

    // Funções para manipular o Modal da Turma
    const handleOpenModalTurma = () => setIsModalTurmaOpen(true);
    const handleCloseModalTurma = () => setIsModalTurmaOpen(false);

    // Funções para manipular o Modal dos Alunos Selecionados
    const handleOpenModalAlunos = () => {
        if (alunosSelecionados.length === 0) return;
        setIsModalAlunosOpen(true);
    }

    const handleCloseModalAlunos = () => setIsModalAlunosOpen(false);

    const recarregarConselho = useCallback(async (cid, tid) => {
        if (!cid || !tid) return;
        try {
        const [respT, respC] = await Promise.all([
            fetch(`${API}/${cid}/avaliacao-turma/${tid}`).then(r => r.json()),
            fetch(`${API}/${cid}`).then(r => r.json())
        ]);
        setAvaliacaoTurma(respT?.avaliacao || null);

        const mapa = {};
        (respC?.conselho?.avaliacoesAlunos || []).forEach(a => {
            mapa[a.tblAluno_idtblAluno] = a;
        });
        setAlunosAvaliados(mapa);
        } catch (e) {
        console.error('Erro ao recarregar conselho:', e);
        }
    }, []);

    // Sincroniza conselhoId com a turma da URL (chave de localStorage por turma).
    useEffect(() => {
        if (!idTurma) { setConselhoId(null); return; }
        const key = `conselhoIntermediarioAtivo:${idTurma}`;
        const raw = localStorage.getItem(key);
        if (!raw) { setConselhoId(null); return; }
        try {
            const obj = JSON.parse(raw);
            const atual = semestreCliente();
            if (obj.semestre !== atual.semestre || obj.ano !== atual.ano) {
                localStorage.removeItem(key);
                setConselhoId(null);
                return;
            }
            setConselhoId(obj.id);
        } catch {
            localStorage.removeItem(key);
            setConselhoId(null);
        }
    }, [idTurma]);

    // Carrega alunos da turma sempre que a turma muda.
    useEffect(() => {
        if(!idTurma) return;

        setCarregando(true);
        fetch(`http://localhost:3001/api/alunos/${idTurma}`)
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) setAlunos(data.alunos);
            })
            .finally(() => setCarregando(false));
    }, [idTurma]);

    // Recarrega avaliações do conselho ativo.
    useEffect(() => {
        if (!conselhoId || !idTurma) return;
        recarregarConselho(conselhoId, idTurma);
    }, [conselhoId, idTurma, recarregarConselho]);


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
                idUsuario
                })
            });
            const dados = await resp.json();
            if (!dados.sucesso) throw new Error(dados.mensagem);
            setConselhoId(dados.conselhoId);
            localStorage.setItem(
                `conselhoIntermediarioAtivo:${idTurma}`,
                JSON.stringify({ id: dados.conselhoId, semestre: dados.semestre, ano: dados.ano })
            );
            await recarregarConselho(dados.conselhoId, idTurma);
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
            localStorage.removeItem(`conselhoIntermediarioAtivo:${idTurma}`);
            setConselhoId(null);
            setAvaliacaoTurma(null);
            setAlunosAvaliados({});
            alert('Conselho finalizado com sucesso!');
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
        setAlunosSelecionados(e.target.checked ? alunos.map(a => a.idtblAluno) : []);
    };

    const handleLimparSelecao = () => setAlunosSelecionados([]);

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
          <span className="font-lg text-gray-700">Conselho Intermediário / ${nomeTurma}</span>

        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] my-5 gap-5">
        <div className="flex justify-around">
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
            <div className="flex flex-col gap-5 p-5 min-h-[220px]">
                <button
                    onClick={conselhoAtivo ? handleFinalizarConselho : handleIniciarConselho}
                    disabled={carregandoConselho || (!conselhoAtivo && modo !== 'iniciar')}
                    className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 font-bold text-lg
                    ${carregandoConselho
                        ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                        : conselhoAtivo
                        ? 'bg-orange-600 text-white cursor-pointer active:scale-95 hover:bg-orange-700'
                        : 'bg-green-600 text-white cursor-pointer active:scale-95 hover:bg-green-700'}`}>
                    {carregandoConselho
                    ? 'Carregando...'
                    : conselhoAtivo ? 'Finalizar Conselho' : 'Iniciar Conselho'}
              </button>

              <button
                    onClick={handleOpenModalTurma}
                    disabled={!conselhoAtivo}
                    className={`avaliar_toda_turma p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                    ${!conselhoAtivo ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                    {avaliacaoTurma ? 'Editar Avaliação da Turma' : 'Avaliar Toda Turma'}
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
                    disabled={!conselhoAtivo || !avaliacaoTurma || alunosSelecionados.length === 0}
                    title={!avaliacaoTurma ? 'Avalie a turma antes de avaliar alunos' : ''}
                    className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200
                    ${(!conselhoAtivo || !avaliacaoTurma || alunosSelecionados.length === 0)
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
                          <button className="bg-red-500 text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] w-[150px] p-1 text-xl rounded-[20px] mr-4 active:scale-95">
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