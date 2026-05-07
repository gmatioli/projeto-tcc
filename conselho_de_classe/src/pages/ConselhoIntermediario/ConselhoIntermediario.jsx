import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom'

import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

import ModalAvaliacaoAlunos from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoAlunos';
import ModalAvaliacaoTurma from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacaoTurma';
import { useEffect } from 'react';
import { Turma } from '../AtribuirTurma/Turma';

const intSituacaoNormal = 16
const intRestritos = 4
const intRetidos = 0
const intObservacoes = 3

const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";
  

export function ConselhoIntermediario() {
    const [searchParams] = useSearchParams();
    const idTurma = searchParams.get('turma');
    const nomeTurma = searchParams.get('nomeTurma');

    const modo = searchParams.get('modo'); 
    const botoesDesabilitados = modo !== 'iniciar';



    const [alunos, setAlunos] = useState([]);
    const [alunosSelecionados, setAlunosSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // Estados independentes para controlar cada modal
    const [isModalTurmaOpen, setIsModalTurmaOpen] = useState(false);
    const [isModalAlunosOpen, setIsModalAlunosOpen] = useState(false);

    // Funções para manipular o Modal da Turma
    const handleOpenModalTurma = () => setIsModalTurmaOpen(true);
    const handleCloseModalTurma = () => setIsModalTurmaOpen(false);

    // Funções para manipular o Modal dos Alunos Selecionados
    const handleOpenModalAlunos = () => setIsModalAlunosOpen(true);
    const handleCloseModalAlunos = () => setIsModalAlunosOpen(false);

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
          <span className="font-lg text-gray-700">Conselho Intermediário / {`${nomeTurma}`}</span>

        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] my-5 gap-5">
                    <div className="flex justify-around">
                        {/* ... (Cards superiores mantidos iguais) ... */}
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
                                <h3 className={`${cardNum}`}>{intSituacaoNormal}</h3>
                                <p className="text_situacao_normal">Situação Normal</p>
                            </div>
                            <div className={`${cardIcon}`}>
                                <img src={situacaoNormalIcon} alt=""className="w-10" />
                            </div>
                        </div>
                        <div className={`${cardInfo} bg-yellow-50 border border-yellow-600`}>
                            <div className={`${cardText} text-yellow-600`}>
                                <h3 className={`${cardNum}`}>{intRestritos}</h3>
                                <p className="text_restritos">Total Observações</p>
                            </div>
                            <div className={`${cardIcon}`}>
                                <img src={restritosIcon} alt="" className="w-10"/>
                            </div>
                        </div>
                        <div className={`${cardInfo} bg-red-50 border border-red-600`}>
                            <div className={`${cardText} text-red-600`}>
                                <h3 className={`${cardNum}`}>{intRetidos}</h3>
                                <p className="text_retidos">Alunos Restritos</p>
                            </div>
                            <div className={`${cardIcon}`}>
                                <img src={retidosIcon} alt="" className="w-10"/>
                            </div>
                        </div>

                <div className="card_avaliacoes">
                    <div className="flex flex-col gap-5 p-5 min-h-[220px]">
                          {/* Botão: Iniciar/Finalizar Conselho
                        <button 
                            onClick={handleToggleConselho}
                            disabled={carregandoConselho}
                            className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 font-bold text-lg
                                ${carregandoConselho 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                                    : conselhoAtivo 
                                        ? 'bg-orange-600 text-white cursor-pointer active:scale-95 hover:bg-orange-700' 
                                        : 'bg-green-600 text-white cursor-pointer active:scale-95 hover:bg-green-700'
                                }`}>
                            {carregandoConselho ? '⏳ Carregando...' : botaoTexto}
                        </button> */}

                        {/* Botão que abre o modal da turma inteira */}
                        <button onClick={handleOpenModalTurma} disabled={botoesDesabilitados}  className={`avaliar_toda_turma  p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 
                            ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                            Avaliar Toda Turma
                        </button>
                        
                        <button onClick={handleLimparSelecao}  disabled={botoesDesabilitados}  className={`limpar_selecao p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 
                            ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-[#FEFEFE] cursor-pointer active:scale-95'}`}>
                            Limpar Seleção
                        </button>

                        {/* Botão que abre o modal dos alunos selecionados */}
                        <button onClick={handleOpenModalAlunos}  disabled={botoesDesabilitados}  className={`p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] transition-all duration-200 
                            ${botoesDesabilitados ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-red-600 text-white cursor-pointer active:scale-95'}`}>
                            Avaliar Selecionados
                        </button>
                    </div>

                    {/* Renderiza ambos os Modais passando seus respectivos estados e funções de fechar */}
                    <ModalAvaliacaoTurma isOpen={isModalTurmaOpen} onClose={handleCloseModalTurma} />
                    <ModalAvaliacaoAlunos isOpen={isModalAlunosOpen} onClose={handleCloseModalAlunos} />
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
                {/* {!idTurma && (
                    <p className="text-center text-gray-500 py-4">
                        Selecione uma turma na sidebar para começar.
                    </p>
                )} */}

                {/* Carregando */}
                {carregando && (
                <p className="text-center text-gray-500 py-4">Carregando alunos...</p>
                )}
                
                    <div  className="p-5 w-[98.5%] bg-[#FEFEFE] border border-black rounded-[10px] box-border m-[10px] h-[50vh] overflow-y-auto overflow overflow-x-hidden pr-[5px] shadow-[0_0_2px_black] ">
                        {!carregando && alunos.map((aluno) => (
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
                                    <p className="text-m underline">3</p>
                                    </div>
                                </div>
                                </button>
                            </div>
                            <div className="div_btn_restrito">
                                <button className="bg-gray-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] w-[150px] p-1 text-xl rounded-[20px] mr-4 active:scale-95">
                                Restrito
                                </button>
                            </div>
                            </div>
                            <hr className='my-[10px] mx-0' />  {/* ← agora está DENTRO do pai */}
                        </div>
                        ))}
              </div>
                {/* Turma sem alunos */}
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