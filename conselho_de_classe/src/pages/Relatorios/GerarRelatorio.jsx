import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';


export function GerarRelatorio() {

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================
  const [conselho, setConselho] = useState('');
  const [semestre, setSemestre] = useState('');

  const [tipoCurso, setTipoCurso] = useState('');
  const [dataConselho, setDataConselho] = useState('');
  const [turma, setTurma] = useState('');

  // ==========================================
  // LISTAS
  // ==========================================
  const [datas, setDatas] = useState([]);
  const [turmas, setTurmas] = useState([]);

  // ==========================================
  // BUSCAR DATAS DOS CONSELHOS
  // ==========================================
  useEffect(() => {

    fetch(`${API.relatorio}/datas`)

      .then((res) => res.json())

      .then((data) => {

       console.log('DATAS recebidas:', data);

        setDatas(data);
      })

      .catch((erro) => {

        console.log(erro);

        alert('Erro ao carregar datas');
      });

  }, []);

  // ==========================================
  // BUSCAR TURMAS
  // ==========================================
  useEffect(() => {

    fetch(`${API.relatorio}/turmas`)

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
  // FILTRAR TURMAS
  // ==========================================
  const turmasFiltradas = turmas.filter((t) => {

    if (!tipoCurso) return true;

    if (tipoCurso === 'tecnico') {
      return t.tipo === 'Curso Técnico';
    }

    if (tipoCurso === 'aprendizagem') {
      return t.tipo === 'Aprendizagem Industrial';
    }

    return true;
  });

  // ==========================================
  // LIMPAR
  // ==========================================
  const handleLimpar = () => {

    setConselho('');
    setSemestre('');
    setTipoCurso('');
    setDataConselho('');
    setTurma('');
  };

  // ==========================================
  // GERAR RELATÓRIO
  // ==========================================
  const handleGerar = async () => {

    if (
      !conselho ||
      !semestre ||
      !tipoCurso ||
      !dataConselho ||
      !turma
    ) {

      alert('Preencha todos os campos.');

      return;
    }

    try {

      const dados = {
        conselho,
        semestre,
        tipoCurso,
        dataConselho,
        turma
      };

      const response = await fetch(
         `${API.relatorio}/gerar-doc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        }
      );

      if (!response.ok) {

        const erro = await response.json();

        alert(erro.mensagem);

        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `Plano_Acao_${turma || 'relatorio'}.docx`;

      document.body.appendChild(a);

      a.click();

      a.remove();

    } catch (erro) {

      console.log(erro);

      alert('Erro ao gerar relatório');
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
            Gerar Relatório
          </span>

        </span>

      </nav>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 w-full max-w-3xl mx-auto">

        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Relatório
        </h1>

        {/* CONSELHO */}
        <div className="mb-5">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conselho(*):
          </label>

          <select
            value={conselho}
            onChange={(e) => setConselho(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
          >

            <option value="">
              Selecione...
            </option>

            <option value="preConselho">
              Pré Conselho
            </option>

            <option value="intermediario">
              Conselho Intermediário
            </option>

          </select>

        </div>

        {/* LINHA 1 */}
        <div className="grid grid-cols-2 gap-4 mb-5">

          {/* DATA */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data(*):
            </label>

            <select
              value={dataConselho}
              onChange={(e) => setDataConselho(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {datas.map((d) => (

                <option
                  key={d.idConselho}
                  value={d.dataFormatada}
                >
                  {d.dataFormatada}
                </option>

              ))}

            </select>

          </div>

          {/* TIPO CURSO */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Curso(*):
            </label>

            <select
              value={tipoCurso}
              onChange={(e) => {

                setTipoCurso(e.target.value);

                // limpa turma ao trocar tipo
                setTurma('');
              }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
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

        </div>

        {/* LINHA 2 */}
        <div className="grid grid-cols-2 gap-4 mb-8">

          {/* TURMA */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma(*):
            </label>

            <select
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              {turmasFiltradas.map((t) => (

                <option
                  key={t.idTurma}
                  value={t.codigo}
                >
                  {t.codigo}
                </option>

              ))}

            </select>

          </div>

          {/* SEMESTRE */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre(*):
            </label>

            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
            >

              <option value="">
                Selecione...
              </option>

              <option value="1">
                1º Semestre
              </option>

              <option value="2">
                2º Semestre
              </option>

              <option value="3">
                3º Semestre
              </option>

              <option value="4">
                4º Semestre
              </option>

            </select>

          </div>

        </div>

        {/* BOTÕES */}
        <div className="flex justify-center gap-6">

          <button
            onClick={handleLimpar}
            className="px-10 py-3 rounded-full border-2 border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition font-medium text-sm hover:scale-95 hover:opacity[0.8]"
          >
            Limpar
          </button>

          <button
            onClick={handleGerar}
            className="px-10 py-3 rounded-full bg-[var(--red-senai)] border-2 border-red-800 text-white hover:bg-red-800 transition font-medium text-sm shadow hover:scale-95 hover:opacity[0.8]"
          >
            Gerar
          </button>

        </div>

      </div>

    </div>
  );
}