import React, { useState } from 'react';

import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

import ModalAvaliacao from '../../components/modalAvaliacaoConselhoIntermediario/ModalAvaliacao'; // Caminho para o componente criado acima

  

const intTotalAlunos = 20
const intSituacaoNormal = 16
const intRestritos = 4
const intRetidos = 0
const intObservacoes = 3

export function ConselhoIntermediario() {

    // Estado que controla se o modal está aberto ou não
    const [isModalOpen, setIsModalOpen] = useState(false);

  // Funções para manipular o estado
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

  return (
      <section>
        <div className="flex flex-col min-w-[72vw] m-5 gap-[150px]">
            <div className="flex justify-around">
                <div className="flex flex-col justify-between border border-black rounded-[15px] py-0 px-5 shadow-[0_0_5px_rgba(0,0,0,0.25)] bg-gray-150 border border-[#CCC]">
                    <div className="mt-[50px] font-bold">
                        <h3 className="text-2xl italic">{intTotalAlunos}</h3>
                        <p className="text_total_alunos">Total de Alunos</p>
                    </div>
                    <div className="flex items-end justify-end m-0">
                        <img src={totalAlunosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className="flex flex-col justify-between border border-black rounded-[15px] py-0 px-5 text-green-600 shadow-[0_0_5px_rgba(0,0,0,0.25)] bg-green-50 border-green-600">
                    <div className="mt-[50px] font-bold">
                        <h3 className="text-2xl italic">{intSituacaoNormal}</h3>
                        <p className="text_situacao_normal">Total de Alunos</p>
                    </div>
                    <div className="flex items-end justify-end m-0">
                        <img src={situacaoNormalIcon} alt=""className="w-10" />
                    </div>
                </div>
                <div className="flex flex-col justify-between border border-black rounded-[15px] py-0 px-5 text-yellow-600 shadow-[0_0_5px_rgba(0,0,0,0.25)] bg-yellow-50 border border-yellow-600">
                    <div className="mt-[50px] font-bold">
                        <h3 className="text-2xl italic">{intRestritos}</h3>
                        <p className="text_restritos">Total de Alunos</p>
                    </div>
                    <div className="flex items-end justify-end m-0">
                        <img src={restritosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className="flex flex-col justify-between border border-black rounded-[15px] py-0 px-5 text-red-600 shadow-[0_0_5px_rgba(0,0,0,0.25)] bg-red-50 border border-red-600">
                    <div className="mt-[50px] font-bold">
                        <h3 className="text-2xl italic">{intRetidos}</h3>
                        <p className="text_retidos">Total de Alunos</p>
                    </div>
                    <div className="flex items-end justify-end m-0">
                        <img src={retidosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className="card_avaliacoes">
                    <div className="flex flex-col gap-5 p-5 min-h-[220px]">
                        <button onClick={handleOpenModal} className="avaliar_toda_turma p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] cursor-pointer">
                            Avaliar Toda Turma
                        </button>
                        <button className="limpar_selecao p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] cursor-pointer">
                            Limpar Seleção
                        </button>
                        <button onClick={handleOpenModal} className="p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] bg-red-600 text-white cursor-pointer">
                            Avaliar Selecionados
                        </button>
                    </div>
                    {/* Renderiza o Modal passando o estado e a função de fechar */}
                    <ModalAvaliacao isOpen={isModalOpen} onClose={handleCloseModal} />
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex justify-between my-0 mx-[10px] text-xl ">
                    <div className="flex gap-2">
                        <input type="checkbox" id="checkbox_selecionar_tudo" className="w-5 h-5 cursor-pointer" />
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
                    <div className="p-5 w-[98.5%] border border-black rounded-[10px] box-border m-[10px] max-h-[40vh] overflow-y-auto overflow overflow-x-hidden pr-[5px]  ">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="checkbox_aluno" className='w-5 h-5 cursor-pointer'/>
                                    <p className="text-xl">Jorge Marques de Salves</p>
                                    <div className="flex items-center my-0 mx-1 gap-1">
                                        <img src={notificationIcon} alt="" className="w-6 h-6 border border-yellow-600 rounded-full p-[1px]"/>
                                        <div className='flex'>
                                            <p className="text-m underline">Ver Observações</p>
                                            <p className="text-m underline">({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="bg-gray-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] w-[150px] p-1 text-xl rounded-[20px] mr-4">Restrito</button>
                                </div>
                            </div>
                            <hr className='my-[10px] mx-0' />
                            
                    </div>
                </div>
                
            </div>
        </div>
      </section>
      
  );
}