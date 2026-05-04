import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
export function GerarTermoCiencia() {
  const navigate = useNavigate();
 
  const [tipoCurso, setTipoCurso] = useState('');
  const [turma, setTurma] = useState('');
  const [aluno, setAluno] = useState('');
  const [dataConselho, setDataConselho] = useState('2024-05-04');
  const [observacoes, setObservacoes] = useState('');
 
  const handleLimpar = () => {
    setTipoCurso('');
    setTurma('');
    setAluno('');
    setDataConselho('2024-03-18');
    setObservacoes('');
  };
 
  const handleGerar = async () => {
    if (!tipoCurso || !turma || !aluno || !dataConselho) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const dataFormatada = new Date(dataConselho).toLocaleDateString('pt-BR');

      const dados = {
        aluno,
        data: dataFormatada,
        turma,
        observacao: observacoes
      };

      const response = await fetch('http://localhost:3001/termoDeCiencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const erroServidor = await response.json();
        alert(`Erro do servidor: ${erroServidor.mensagem}`);
        return; 
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'termoDeCiencia.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error('Erro no fetch:', error);
      alert('Erro de conexão com o servidor ao gerar Termo de Ciência.');
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
          <span className="font-medium text-gray-700">Gerar Termo de Ciência</span>
        </span>
      </nav>
 
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-3xl mx-auto">
        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Termo de Ciência
        </h1>
 
        {/* Linha: Tipo de Curso + Turma */}
        <div className="flex gap-4 mb-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Curso(*):
            </label>
            <select
              value={tipoCurso}
              onChange={(e) => setTipoCurso(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            >
              <option value="">Selecione...</option>
              <option value="tecnico">Curso Técnico</option>
              <option value="aprendizagem">Aprendizagem Industrial</option>
            </select>
          </div>
 
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma(*):
            </label>
            <select
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            >
              <option value="">Selecione...</option>
              <option value="DEV3N">DEV 3N</option>
              <option value="ADM1M">ADM 1M</option>
              <option value="T2D">T2D</option>
              <option value="MECA1M">MECA 1M</option>
            </select>
          </div>
        </div>
 
        {/* Linha: Aluno + Data do Conselho */}
        <div className="flex gap-4 mb-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aluno(*):
            </label>
            <select
              value={aluno}
              onChange={(e) => setAluno(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            >
              <option value="">Selecione...</option>
              <option value="Sofia Leiva Pires">Sofia Leiva Pires</option>
              <option value="João Pedro Silva">João Pedro Silva</option>
              <option value="Bruno Fernandes">Bruno Fernandes</option>
              <option value="Carlos Eduardo Souza">Carlos Eduardo Souza</option>
            </select>
          </div>
 
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Conselho(*):
            </label>
            <input
              type="date"
              value={dataConselho}
              onChange={(e) => setDataConselho(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
          </div>
        </div>
 
        {/* Observações */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações:
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition resize-none"
            placeholder=""
          />
        </div>
 
        {/* Botões */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handleLimpar}
            className="px-10 py-3 rounded-full border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition font-medium text-sm"
          >
            Limpar
          </button>
          <button
            onClick={handleGerar}
            className="px-10 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm shadow"
          >
            Gerar
          </button>
        </div>
      </div>
    </div>
  );
}