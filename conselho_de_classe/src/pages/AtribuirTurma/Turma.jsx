import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

        fetch(
            'http://localhost:3001/api/AtribuirTurma/docentes'
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

        fetch(
            'http://localhost:3001/api/AtribuirTurma/turmas'
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
    // SALVAR
    // ==========================================
    const handleSalvar = () => {
    if (!docenteSelecionado) {
        alert('Por favor, selecione um docente.');
        return;
    }

    fetch('http://localhost:3001/api/AtribuirTurma/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idDocente: docenteSelecionado,
            turmas: turmasSelecionadas // Array de IDs
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            alert('Atribuições salvas com sucesso!');
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
                        <div className='flex flex-col w-[35%]'>

                            <label className="text-sm font-semibold mb-2">
                                Turmas Selecionadas
                            </label>

                            <div className="border border-gray-400 rounded-xl p-4 h-[250px] overflow-y-auto bg-white">

                                {turmas
                                    .filter((t) =>
                                        turmasSelecionadas.includes(
                                            t.idTurma
                                        )
                                    )
                                    .map((turma) => (

                                        <div
                                            key={turma.idTurma}
                                            className="border-b border-gray-300 pb-3 mb-3 text-sm text-gray-700"
                                        >
                                            {turma.codigo}
                                        </div>

                                    ))}

                            </div>

                        </div>

                        {/* TURMAS */}
                        <div className="flex flex-col w-[65%]">

                            <label className="text-sm font-semibold mb-2">
                                Turmas
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