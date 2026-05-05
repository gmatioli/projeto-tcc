import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

import turmasAtivasIcon from '../../assets/dashboard/turmas-ativas-icon.svg'
import totalAlunosIcon from '../../assets/dashboard/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/dashboard/situacao-normal-icon.svg'
import restritosIcon from '../../assets/dashboard/restritos-icon.svg'
import retidosIcon from '../../assets/dashboard/retidos-icon.svg'

const intTotalAlunos = 20
  const intSituacaoNormal = 16
  const intRestritos = 4
  const intRetidos = 0
  const intObservacoes = 3

  const cardInfo = "flex flex-col justify-between border rounded-[15px] h-[26vh] w-[12vw] shadow-[2px_2px_5px_rgba(0,0,0,0.5)]";
  const cardNum = "text-3xl italic";
  const cardText = "mt-10 ml-4 text-lg font-bold";
  const cardIcon = "flex items-end justify-end m-[0_15px_15px_0]";

export function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // CONFIGURAÇÃO DO GRÁFICO 1: ROSCA (MOTIVOS)
  // ==========================================
  const motivosData = {
    labels: ['Aproveitamento', 'Comportamental', 'Frequência'],
    datasets: [
      {
        data: [50, 40, 10],
        backgroundColor: ['#5b21b6', '#ea580c', '#06b6d4'],
        borderWidth: 0,
      },
    ],
  };

  const motivosOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11, family: 'Inter, ui-sans-serif, system-ui' },
        },
      },
    },
  };

  // ==========================================
  // CONFIGURAÇÃO DO GRÁFICO 2: BARRAS HORIZONTAIS
  // ==========================================
  const rankingData = {
    labels: ['CPTMDS-04', 'TDS-02', 'MECA-04', 'SCANIAMECA-03', 'ELET-04', 'ENELELET-02', 'AUTO-01'],
    datasets: [
      {
        data: [13, 19, 9, 17, 3, 12, 8],
        backgroundColor: (context) => {
          const value = context.raw; // Pegando o valor atual no React
          if (value > 15) return '#7c3aed'; // Crítico
          if (value >= 10) return '#f97316'; // Alto
          if (value >= 7) return '#2dd4bf'; // Médio
          return '#4ade80';                 // Normal
        },
        barThickness: 16,
        borderRadius: 3,
      },
    ],
  };

  const rankingOptions = {
    indexAxis: 'y', // Inverte para barra horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        max: 20,
        grid: {
          drawBorder: false,
          color: '#e5e7eb',
          borderDash: [5, 5],
        },
        ticks: { font: { size: 11, family: 'Inter, ui-sans-serif, system-ui' } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, ui-sans-serif, system-ui' } },
      },
    },
  };
  
  return (
    <section>
        <nav className="mb-4">
        <span className="text-sm text-gray-500">
          {' / '}
          <span className="font-medium text-gray-700">Dashboard</span>
        </span>
      </nav>
        <div className="flex flex-col min-w-[72vw] m-5 gap-[150px]">
            <div className="flex justify-around">
                {/* ... (Cards superiores mantidos iguais) ... */}
                <div className={`${cardInfo} bg-gray-150 border border-black`}>
                    <div className={`${cardText}`}>
                        <h3 className={`${cardNum} text-2xl`}>{intTotalAlunos}</h3>
                        <p className="text_total_alunos">Total de Alunos</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={totalAlunosIcon} alt="" className="w-10"/>
                    </div>
                </div>
                <div className={`${cardInfo} bg-gray-150 border border-[#888]`}>
                    <div className={`${cardText}`}>
                        <h3 className={`${cardNum}`}>{intTotalAlunos}</h3>
                        <p className="text_total_alunos">Turmas Ativas</p>
                    </div>
                    <div className={`${cardIcon}`}>
                        <img src={turmasAtivasIcon} alt="" className="w-10"/>
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
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full font-sans antialiased">
      
      {/* 1. Gráfico de Rosca (Aproveitamento) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full md:w-2/5 flex justify-center items-center min-h-[300px]">
        <Doughnut data={motivosData} options={motivosOptions} />
      </div>

      {/* 2. Gráfico de Barras (Ranking Turmas) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full md:w-3/5 flex flex-col justify-between">
        
        {/* Título */}
        <div className="text-center mb-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            RANKING - Turmas com Maior Índice de Retenção
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            % de alunos retidos por turma - ciclo 2026/1
          </p>
        </div>

        {/* Container do Gráfico */}
        <div className="relative w-full h-[250px]">
          <Bar data={rankingData} options={rankingOptions} />
        </div>

        {/* Legenda Customizada com Tailwind */}
        <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-600 mt-6 font-medium">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#7c3aed]"></div> {'>'}15% Crítico</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#f97316]"></div> 10-14% Alto</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#2dd4bf]"></div> 7-9% Médio</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#4ade80]"></div> {'<'}7% Normal</div>
        </div>

      </div>

    </div>
      </section>
  );
}
