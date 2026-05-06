import React, { useState } from 'react';

import totalAlunosIcon from '../../assets/pre-conselho/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/pre-conselho/situacao-normal-icon.svg'
import restritosIcon from '../../assets/pre-conselho/restritos-icon.svg'
import retidosIcon from '../../assets/pre-conselho/retidos-icon.svg'
import notificationIcon from '../../assets/pre-conselho/notification-icon.svg'

import ModalAvaliacao from '../../components/modalAvaliacaoPreConselho/ModalAvaliacao';
  

const intTotalAlunos = 20
const intSituacaoNormal = 16
const intRestritos = 4
const intRetidos = 0
const intObservacoes = 3

const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
const cardNum = "text-3xl italic";
const cardText = "mt-10 ml-4 text-lg font-bold";
const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";

export function PreConselho() {

    // Estado que controla se o modal está aberto ou não
    const [isModalOpen, setIsModalOpen] = useState(false);

  // Funções para manipular o estado
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

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
          <span className="font-medium text-gray-700">Pré-Conselho</span>
        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] my-5 ">
            <div className="flex justify-around">
                {/* ... (Cards superiores mantidos iguais) ... */}
                <div className={`${cardInfo} bg-[#FEFEFE] border border-black`}>
                    <div className={`${cardText}`}>
                        <h3 className={`${cardNum} text-2xl`}>{intTotalAlunos}</h3>
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
                <button className="limpar_selecao bg-[#FEFEFE] p-[10px] w-[350px] mt-[40px] rounded-[15px] border border-black shadow-[0_0_3px_black] cursor-pointer trasition-all duration-200 active:scale-95">
                    Limpar Seleção
                </button>
                <button onClick={handleOpenModal} className="p-[10px] w-[350px] rounded-[15px] border border-black shadow-[0_0_3px_black] bg-red-600 text-white cursor-pointer trasition-all duration-200 active:scale-95">
                    Avaliar Selecionados
                </button>
            </div>
                {/* Renderiza o Modal passando o estado e a função de fechar */}
                <ModalAvaliacao isOpen={isModalOpen} onClose={handleCloseModal} />
                </div>
            </div>
        </div>
        
            <div className="flex flex-col mx-2 mr-6 ">
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
                    <div className="p-5 w-[98.5%] bg-[#FEFEFE] border border-black rounded-[10px] box-border m-[10px] h-[50vh] overflow-y-auto overflow overflow-x-hidden pr-[5px] shadow-[0_0_2px_black]">
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
      </section>
      
  );
}