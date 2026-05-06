import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function GerarTermoCiencia() {

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [tipoCurso, setTipoCurso] = useState('');
  const [turma, setTurma] = useState('');
  const [aluno, setAluno] = useState('');
  const [dataConselho, setDataConselho] = useState('2024-05-04');
  const [observacoes, setObservacoes] = useState('');

  // ==========================================
  // LISTAS
  // ==========================================
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  

// ==========================================
// FILTRAR TURMAS PELO TIPO
// ==========================================
const turmasFiltradas = turmas.filter((t) => {

  if (tipoCurso === 'tecnico') {

    return t.tipo === 'Curso Técnico';
  }

  if (tipoCurso === 'aprendizagem') {

    return t.tipo === 'Aprendizagem Industrial';
  }

  return false;
});
  // ==========================================
  // BUSCAR TURMAS
  // ==========================================
  useEffect(() => {

    fetch('http://localhost:3001/api/turmas')

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
  // BUSCAR ALUNOS DA TURMA
  // ==========================================
  useEffect(() => {

    // se não selecionou turma
    if (!turma) {

      setAlunos([]);
      return;
    }

    fetch(`http://localhost:3001/api/alunos?turma=${turma}`)

      .then((res) => res.json())

      .then((data) => {

        console.log('ALUNOS:', data);

        setAlunos(data);
      })

      .catch((erro) => {

        console.log(erro);

        alert('Erro ao carregar alunos');
      });

  }, [turma]);

  // ==========================================
  // LIMPAR
  // ==========================================
  const handleLimpar = () => {

    setTipoCurso('');
    setTurma('');
    setAluno('');
    setDataConselho('2024-03-18');
    setObservacoes('');
  };

  // ==========================================
  // GERAR DOCX
  // ==========================================
  const handleGerar = async () => {

    if (!tipoCurso || !turma || !aluno || !dataConselho) {

      alert('Por favor, preencha todos os campos obrigatórios.');

      return;
    }

    try {

    const [ano, mes, dia] = dataConselho.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

      const dados = {
        aluno,
        data: dataFormatada,
        turma,
        observacao: observacoes
      };

      const response = await fetch(
        'http://localhost:3001/termoDeCiencia',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        }
      );

      if (!response.ok) {

        const erroServidor = await response.json();

        alert(`Erro: ${erroServidor.mensagem}`);

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'termoCiencia.docx';

      document.body.appendChild(a);

      a.click();

      a.remove();

    } catch (error) {

      console.error(error);

      alert('Erro ao gerar documento');
    }
  };

  return (

    <div className="flex flex-col h-full bg-gray-100 p-5 overflow-auto">

      {/* Breadcrumb */}
      <nav className="mb-4">

        <span className="text-sm text-gray-500">

          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Relatórios
          </button>

          {' / '}

          <span className="font-medium text-gray-700">
            Gerar Termo de Ciência
          </span>

        </span>

      </nav>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-3xl mx-auto">

        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Termo de Ciência
        </h1>

        {/* TIPO + TURMA */}
        <div className="flex gap-4 mb-5">

          {/* TIPO */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Curso(*):
            </label>

            <select
              value={tipoCurso}
             onChange={(e) => {
              setTipoCurso(e.target.value);
                setTurma('');
                setAluno('');
                setAlunos([]);
                }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              <option value="tecnico">
                Curso Técnico
              </option>

              <option value="aprendizagem">
                Aprendizagem Industrial
              </option>

            </select>

          </div>

          {/* TURMA */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma(*):
            </label>

            <select
              value={turma}
              onChange={(e) => {

                setTurma(e.target.value);

                // limpa aluno ao trocar turma
                setAluno('');
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {Array.isArray(turmasFiltradas) && turmasFiltradas.map((t) => (

                <option
                  key={t.idTurma}
                  value={t.codigo}
                >
                  {t.codigo}
                </option>

              ))}

            </select>

          </div>

        </div>

        {/* ALUNO + DATA */}
        <div className="flex gap-4 mb-5">

          {/* ALUNO */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aluno(*):
            </label>

            <select
              value={aluno}
              onChange={(e) => setAluno(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {Array.isArray(alunos) && alunos.map((a) => (

                <option
                  key={a.idtbdAluno}
                  value={a.nome}
                >
                  {a.nome}
                </option>

              ))}

            </select>

          </div>

          {/* DATA */}
          <div className="flex-1">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Conselho(*):
            </label>

            <input
              type="date"
              value={dataConselho}
              onChange={(e) => setDataConselho(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />

          </div>

        </div>

        {/* OBSERVAÇÃO */}
        <div className="mb-8">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações:
          </label>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none"
          />

        </div>

        {/* BOTÕES */}
        <div className="flex justify-center gap-6">

          <button
            onClick={handleLimpar}
            className="px-10 py-3 rounded-full border border-gray-400"
          >
            Limpar
          </button>

          <button
            onClick={handleGerar}
            className="px-10 py-3 rounded-full bg-red-600 text-white"
          >
            Gerar
          </button>

        </div>

      </div>

    </div>
  );
}