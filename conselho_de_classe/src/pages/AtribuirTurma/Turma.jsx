import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Turma(){
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Atribuir turma   | Sistema de Conselhos";
    }, []);

    return(
        <div className='min-h-screen flex flex-col'>
            <header className="absolute w-full pt-5 pl-[50px]">
                <img src="/img/logo-senai.png" alt="Logo SENAI" className="h-[50px] mt-2" />
            </header>
            
            <main className='flex-1 flex justify-center items-center'>
                <div className='w-full max-w-4xl min-h-[500px] bg-[#E9E9E9] rounded-xl p-6 shadow-xl'>
                    
                    <div className='border-b border-gray-300 pb-2 mb-3 '>
                        <h1 className='text-center font-bold text-xl'>Atribuir Turma a Docente</h1>
                    </div>
                    
                    <div className='flex gap-6 mb-10'>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-semibold mb-1">Docente</label>
                            <select className="border border-gray-400 rounded-xl p-2 outline-none text-sm">
                                <option value="">Selecione um docente</option>
                            </select>
                        </div>
                        <div className="flex flex-col flex-1">
                             <label className="text-sm font-semibold mb-1">Tipo Curso</label>
                            <select className="border border-gray-400 rounded-xl p-2 outline-none text-sm">
                                <option value="">Selecione o tipo curso</option>
                            </select>
                        </div>
                        <div className="flex flex-col flex-1">
                             <label className="text-sm font-semibold mb-1">Curso</label>
                            <select className="border border-gray-400 rounded-xl p-2 outline-none text-sm">
                                <option value="">Selecione um curso</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-6 mt-8">
                        <div className='flex flex-col w-[35%]'>
                            <label className="text-sm font-semibold mb-2">Turmas Selecionadas</label>
                            <div className="border border-gray-400 rounded-xl p-4 h-[250px] overflow-y-auto bg-white">
                                <div className="border-b border-gray-300 pb-3 mb-3 text-sm text-gray-700">
                                    Técnico em Desenvolvimento de Sistemas (CPTM4T)
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col w-[65%]">
                            <label className="text-sm font-semibold mb-2">Turmas: </label>
                                <div className="border border-gray-400 rounded-xl p-4 h-[250px] overflow-y-auto bg-white">
                                    <div className="flex items-center gap-3 border-b border-gray-300 pb-3 mb-3 text-sm text-gray-700">
                                        <input type="checkbox"  className='w-4 h-4 cursor-pointer accent-[#00A8E8]' />   
                                        <label className="text-sm text-gray-700">
                                            Técnico em Desenvolvimento de Sistemas (CPTM4T)
                                        </label>
                                    </div> 
                                </div>         
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button onClick={() => navigate('/configuracoes') } className="px-8 py-2 rounded-full border border-gray-400 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors">
                            Fechar
                        </button>
                        <button className="px-8 py-2 rounded-full bg-[#E20814] text-white font-semibold hover:bg-red-700 transition-colors">
                            Salvar
                        </button>
                    </div>

                </div>
            </main>
        </div>
    )
}