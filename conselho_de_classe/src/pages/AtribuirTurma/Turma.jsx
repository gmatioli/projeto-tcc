import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API, authFetch } from '../../config/api';

export function Turma() {

    const navigate = useNavigate();

    // ==========================================
    // STATES
    // ==========================================
    const [docentes, setDocentes] = useState([]);

    const [turmas, setTurmas] = useState([]);

    const [docenteSelecionado, setDocenteSelecionado] = useState('');

    const [tipoCurso, setTipoCurso] = useState('');

    const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);

    const [turmasAtuais, setTurmasAtuais] = useState([]);

    // ==========================================
    // TITLE
    // ==========================================
    useEffect(() => {

        document.title =
            "Atribuir turma | Sistema de Conselhos";

    }, []);

    // ==========================================
    // BUSCAR DOCENTES
    // ==========================================
    useEffect(() => {

        authFetch(
            `${API.atribuirTurma}/docentes`
        )

            .then((res) => res.json())

            .then((data) => {

                console.log('DOCENTES:', data);

                setDocentes(data);
            })

            .catch((erro) => {

                console.log(erro);

                alert('Erro ao carregar docentes');
            });

    }, []);

    // ==========================================
    // BUSCAR TURMAS
    // ==========================================
    useEffect(() => {

        authFetch(
            `${API.atribuirTurma}/turmas`
        )

            .then((res) => res.json())

            .then((data) => {

                console.log('TURMAS:', data);

                setTurmas(data);
            })

            .catch((erro) => {

                console.log(erro);

                alert('Erro ao carregar turmas');
            });

    }, []);

    // ==========================================
    // BUSCAR TURMAS DO DOCENTE SELECIONADO
    // ==========================================
    useEffect(() => {
        if (!docenteSelecionado) {
            setTurmasAtuais([]);
            return;
        }

        authFetch(`${API.atribuirTurma}/docente/${docenteSelecionado}/turmas`)
            .then((res) => res.json())
            .then((data) => {
                console.log('TURMAS JÁ ATRIBUÍDAS:', data);
                // BLINDAGEM: Só salva se realmente for um Array
                if (Array.isArray(data)) {
                    setTurmasAtuais(data);
                } else {
                    console.error("O backend não retornou um array:", data);
                    setTurmasAtuais([]);
                }
            })
            .catch((erro) => {
                console.error('Erro ao carregar turmas atuais:', erro);
                setTurmasAtuais([]);
            });

    }, [docenteSelecionado]);

    // ==========================================
    // FILTRAR TURMAS POR TIPO
    // ==========================================
    const turmasFiltradas = turmas.filter((turma) => {
        // Se não selecionou filtro, mostra todas
        if (!tipoCurso) return true;

        // Se o backend não enviou o tipo por algum motivo, não mostra (evita erro)
        if (!turma.tipo) return false;

        const tipoNormalizado = turma.tipo.toLowerCase();

        if (tipoCurso === 'tecnico') {
            // Verifica se no banco está "Curso Técnico" ou apenas "Técnico"
            return tipoNormalizado.includes('técnico') || tipoNormalizado.includes('tecnico');
        }

        if (tipoCurso === 'aprendizagem') {
            return tipoNormalizado.includes('aprendizagem');
        }

        return true;
    });

    // ==========================================
    // CHECKBOX
    // ==========================================
    const handleCheckbox = (idTurma) => {

        if (turmasSelecionadas.includes(idTurma)) {

            setTurmasSelecionadas(

                turmasSelecionadas.filter(
                    (id) => id !== idTurma
                )
            );

        } else {

            setTurmasSelecionadas([
                ...turmasSelecionadas,
                idTurma
            ]);
        }
    };

    // ==========================================
    // EXCLUIR TURMA
    // ==========================================
    const handleExcluirTurma = (idTurma) => {
        // Pede uma confirmação rápida (opcional, mas recomendado)
        const confirmacao = window.confirm("Tem certeza que deseja remover esta turma do docente?");
        if (!confirmacao) return;

        authFetch(`${API.atribuirTurma}/docente/${docenteSelecionado}/turma/${idTurma}`, {
            method: 'DELETE',
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                // Mostra a mensagem que você pediu
                alert('Turma do docente removida!');
                
                // Atualiza a tela na hora removendo a turma excluída do array
                setTurmasAtuais(
                    turmasAtuais.filter((turma) => turma.idTurma !== idTurma)
                );
            } else {
                alert('Erro ao remover: ' + (data.mensagem || 'Erro desconhecido'));
            }
        })
        .catch(err => {
            console.error('Erro na requisição de exclusão:', err);
            alert('Erro ao conectar com o servidor');
        });
    };

    // ==========================================
    // SALVAR
    // ==========================================
    const handleSalvar = () => {
        if (!docenteSelecionado) {
            alert('Por favor, selecione um docente.');
            return;
        }

        authFetch(`${API.atribuirTurma}/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idDocente: docenteSelecionado,
                turmas: turmasSelecionadas
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                alert('Atribuições salvas com sucesso!');
                
                // 1. Limpa os checkboxes que o usuário marcou no preview
                setTurmasSelecionadas([]);
                
                // 2. Limpa os dropdowns voltando para a opção inicial (value="")
                setDocenteSelecionado('');
                setTipoCurso('');
                
            } else {
                alert('Erro ao salvar: ' + (data.mensagem || 'Erro desconhecido'));
            }
        })
        .catch(err => {
            console.error('Erro na requisição:', err);
            alert('Erro ao conectar com o servidor');
        });
    };

    return (

        <div className='min-h-screen flex flex-col'>

            {/* HEADER */}
            <header className="absolute w-full pt-5 pl-[50px]">

                <img
                    src="/img/logo-senai.png"
                    alt="Logo SENAI"
                    className="h-[50px] mt-2"
                />

            </header>

            {/* MAIN */}
            <main className='flex-1 flex justify-center items-center'>

                <div className='w-full max-w-4xl min-h-[500px] bg-[#E9E9E9] rounded-xl p-6 shadow-xl'>

                    {/* TÍTULO */}
                    <div className='border-b border-gray-300 pb-2 mb-3'>

                        <h1 className='text-center font-bold text-xl'>
                            Atribuir Turma a Docente
                        </h1>

                    </div>

                    {/* FILTROS */}
                    <div className='flex gap-6 mb-10'>

                        {/* DOCENTE */}
                        <div className="flex flex-col flex-1">

                            <label className="text-sm font-semibold mb-1">
                                Docente
                            </label>

                            <select
                                value={docenteSelecionado}
                                onChange={(e) =>
                                    setDocenteSelecionado(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-400 rounded-xl p-2 outline-none text-sm"
                            >

                                <option value="">
                                    Selecione um docente
                                </option>

                                {docentes.map((docente) => (

                                    <option
                                        key={docente.idUsuario}
                                        value={docente.idUsuario}
                                    >
                                        {docente.nomeUsuario}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* TIPO CURSO */}
                        <div className="flex flex-col flex-1">

                            <label className="text-sm font-semibold mb-1">
                                Tipo Curso
                            </label>

                            <select
                                value={tipoCurso}
                                onChange={(e) =>
                                    setTipoCurso(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-400 rounded-xl p-2 outline-none text-sm"
                            >

                                <option value="">
                                    Selecione o tipo curso
                                </option>

                                <option value="tecnico">
                                    Curso Técnico
                                </option>

                                <option value="aprendizagem">
                                    Aprendizagem Industrial
                                </option>

                            </select>

                        </div>

                    </div>

                    {/* LISTAS */}
                    <div className="flex gap-6 mt-8">

                        {/* SELECIONADAS */}
                        <div className='flex flex-col w-[50%]'>
                            <label className="text-sm font-semibold mb-2">
                                Turmas Atuais do Docente
                            </label>

                            <div className="border border-gray-400 rounded-xl p-4 h-[250px] overflow-y-auto bg-white flex flex-col gap-1">     

                                {/* 1. TURMAS JÁ ATRIBUÍDAS (SALVAS NO BANCO) */}
                                {turmasAtuais.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center mt-2">
                                        Nenhuma turma atribuída no momento.
                                    </p>
                                ) : (
                                    turmasAtuais.map((turma) => (
                                        <div
                                            key={`atual-${turma.idTurma}`}
                                            className="flex items-center justify-between border-b border-gray-300 pb-2 text-sm text-gray-700"
                                        >
                                            <span>{turma.codigo}</span>
                                            
                                            <button 
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1" 
                                                title="Excluir Turma do Docente"
                                                onClick={() => handleExcluirTurma(turma.idTurma)}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                                    <path d="M10 11v6"/>
                                                    <path d="M14 11v6"/>
                                                    <path d="M9 6V4h6v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}

                                {/* 2. DIVISÓRIA E TURMAS QUE SERÃO ADICIONADAS (PREVIEW) */}
                                {turmasSelecionadas.length > 0 && (
                                    <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-400">
                                        
                                        <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
                                            Turmas que serão adicionadas
                                        </p>

                                        {turmas
                                            .filter((t) => turmasSelecionadas.includes(t.idTurma))
                                            .map((turma) => (
                                                <div
                                                    key={`nova-${turma.idTurma}`}
                                                    className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-2 text-sm text-green-700 font-medium bg-green-50/50 p-1 rounded"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={true}
                                                        onChange={() => handleCheckbox(turma.idTurma)}
                                                        className='w-4 h-4 cursor-pointer accent-green-600'
                                                        title="Remover da lista de adição"
                                                    />
                                                    
                                                    <span>{turma.codigo}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}

                            </div>

                        </div>

                        {/* TURMAS */}
                        <div className="flex flex-col w-[50%]">

                            <label className="text-sm font-semibold mb-2">
                                Atribuir Turma
                            </label>

                            <div className="border border-gray-400 rounded-xl p-4 h-[250px] overflow-y-auto bg-white">

                                {turmasFiltradas.map((turma) => (

                                    <div
                                        key={turma.idTurma}
                                        className="flex items-center gap-3 border-b border-gray-300 pb-3 mb-3 text-sm text-gray-700"
                                    >

                                        <input
                                            type="checkbox"
                                            checked={turmasSelecionadas.includes(
                                                turma.idTurma
                                            )}
                                            onChange={() =>
                                                handleCheckbox(
                                                    turma.idTurma
                                                )
                                            }
                                            className='w-4 h-4 cursor-pointer accent-[#00A8E8]'
                                        />

                                        <label>
                                            {turma.codigo}
                                        </label>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>

                    {/* BOTÕES */}
                    <div className="flex justify-center gap-4 mt-8">

                        <button
                            onClick={() =>
                                navigate('/configuracoes')
                            }
                            className="px-8 py-2 rounded-full border border-gray-400 bg-gray-200 text-gray-700 font-semibold"
                        >
                            Fechar
                        </button>

                        <button
                            onClick={handleSalvar}
                            className="px-8 py-2 rounded-full bg-[#E20814] text-white font-semibold"
                        >
                            Salvar
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}