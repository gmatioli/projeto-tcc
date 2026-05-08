import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
export function GerarAta() {
  const navigate = useNavigate();
 
  const [conselho, setConselho] = useState('');
  const [ano, setAno] = useState('');
  const [semestre, setSemestre] = useState('');
  const [dataConselho, setDataConselho] = useState('2024-05-04');
 
  const handleLimpar = () => {
    setConselho('');
    setAno('');
    setSemestre('');
    setDataConselho('2024-05-04');
  };
 
  // const handleGerar = () => {
  //   if (!conselho || !ano || !semestre || !dataConselho) {
  //     alert('Por favor, preencha todos os campos obrigatórios.');
  //     return;
  //   }
  //   alert('Ata gerada com sucesso!');
  // };
 

  //docs gerar ataaaaa----------------------------------------------------
 const gerarAta = async () => {

  if (!conselho || !ano || !semestre || !dataConselho) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
   const dataFormatada = new Date(dataConselho)
        .toLocaleDateString('pt-BR');

    const dados = {
      conselho,
      semestre,
      ano,
      data: dataFormatada
    };

    const response = await fetch(
      'http://localhost:3001/gerar-doc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'ata.docx';

    document.body.appendChild(a);

    a.click();

    a.remove();

  } catch (error) {

    console.log(error);

    alert('Erro ao gerar ata');
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
          <span className="font-medium text-gray-700">Gerar Ata</span>
        </span>
      </nav>
 
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-3xl mx-auto">
        <h1 className="text-center text-xl font-bold tracking-widest text-gray-800 mb-8 uppercase">
          Geração de Ata
        </h1>
 
        {/* Campo Conselho */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conselho(*):
          </label>
          <select
            value={conselho}
            onChange={(e) => setConselho(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          >
            <option value="">Selecione...</option>
            <option value="final">Conselho Final</option>
          </select>
        </div>
 
        {/* Linha: Ano + Semestre + Data */}
        <div className="flex gap-4 mb-8">
          {/* Ano */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano(*):
            </label>
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            >
              <option value="">Selecione...</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
 
          {/* Semestre */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre(*):
            </label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            >
              <option value="">Selecione...</option>
              <option value="1">1º Semestre</option>
              <option value="2">2º Semestre</option>
            </select>
          </div>
 
          {/* Data do Conselho */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Conselho (*):
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataConselho}
                onChange={(e) => setDataConselho(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
 
        {/* Botões */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handleLimpar}
            className="px-10 py-3 rounded-full border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition font-medium text-sm">
            Limpar
          </button>
          <button
            onClick={gerarAta}
            className="px-10 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm shadow">
            Gerar
          </button>
        </div>
      </div>
    </div>
  );
}