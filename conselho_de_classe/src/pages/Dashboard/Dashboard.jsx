import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';

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

  const intObservacoes = 3

  const cardInfo = "flex flex-col justify-between border-2 rounded-[15px] min-h-[28vh] w-[14vw] shadow-[2px_2px_8px_gray]";
  const cardNum = "text-3xl italic";
  const cardText = "mt-[6vh] mx-[1vw] text-2xl font-bold";
  const cardIcon = "flex items-end justify-end m-[0_1vh_1vh_0]";

export function Dashboard() {
  const [TotalAlunos, setTotalAlunos] = useState(0)
  const [TotalTurmas, setTotalTurmas] = useState(0)
  const [totalSituacaoNormal, setTotalSituacaoNormal] = useState(0);
  const [totalRestritos, setTotalRestritos] = useState(0);

  useEffect(() => {
    fetch(`${API.dashboard}/dados`)
        .then(resposta => resposta.json()) 
        .then(json => {
            if (json.sucesso) {
                setTotalAlunos(json.dados.totalAlunos);
                setTotalTurmas(json.dados.totalTurmas);
                setTotalSituacaoNormal(json.dados.totalSituacaoNormal);
                setTotalRestritos(json.dados.totalRestritos);

            } else {
                console.error("Erro do servidor:", json.mensagem);
            }
        })
        .catch(erro => console.error("Erro de conexão:", erro));
}, []);


  const navigate = useNavigate();

  // ==========================================
  // CONFIGURAÇÃO DO GRÁFICO 1: ROSCA (MOTIVOS)
  // ==========================================
  const [motivosData, setMotivosData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#5b21b6', '#f97316', '#06b6d4'], // Suas cores originais
        borderWidth: 0,
      },
    ],
  });

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
  
  useEffect(() => {
    fetch(`${API.dashboard}/dados`)
      .then(res => res.json())
      .then(json => {
        if (json.sucesso && json.dados.dadosGraficoRosca) {
          const labelsBanco = json.dados.dadosGraficoRosca.map(item => item.natureza);
          
          const valoresBanco = json.dados.dadosGraficoRosca.map(item => parseInt(item.quantidade));
  
          setMotivosData({
            labels: labelsBanco,
            datasets: [
              {
                data: valoresBanco,
                backgroundColor: ['#5b21b6', '#f97316', '#06b6d4'],
                borderWidth: 0,
              },
            ],
          });
        }
      })
      .catch(err => console.error("Erro ao carregar gráfico:", err));
  }, []);

  // ==========================================
  // CONFIGURAÇÃO DO GRÁFICO 2: BARRAS HORIZONTAIS
  // ==========================================
  const [rankingData, setRankingData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  });

  // Opções para o gráfico ficar deitado e bonito
  const rankingOptions = {
    indexAxis: 'y', // Isso faz as barras ficarem horizontais!
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false } // Escondemos a legenda padrão do topo
    }
  };

  useEffect(() => {
    fetch(`${API.dashboard}/dados`)
      .then((res) => res.json())
      .then((json) => {
        if (json.sucesso) {
          // ... o seu código do gráfico de pizza continua aqui ...

          // 3. Alimentando o gráfico de Ranking
          if (json.dados.rankingTurmas) {
            const turmasBanco = json.dados.rankingTurmas.map(item => item.turma);
            const quantidadesBanco = json.dados.rankingTurmas.map(item => parseInt(item.quantidade_restritos));

            const coresDinamicas = json.dados.rankingTurmas.map(item => {
              const qtdRestritos = parseInt(item.quantidade_restritos) || 0;
              const totalAlunos = parseInt(item.total_alunos) || 1; 
              
              const porcentagem = (qtdRestritos / totalAlunos) * 100;

              if (porcentagem > 50) return '#8b5cf6'; 
              if (porcentagem >= 25) return '#f97316'; 
              if (porcentagem >= 10) return '#06b6d4'; 
              return '#4ade80';                        
          });

            setRankingData({
              labels: turmasBanco,
              datasets: [{
                label: 'Alunos com restrição',
                data: quantidadesBanco,
                backgroundColor: coresDinamicas,
                borderRadius: 4, // Deixa a ponta da barra levemente arredondada
              }]
            });
          }
        }
      })
      .catch((err) => console.error("Erro:", err));
  }, []);
  
  return (
    <section className="flex flex-col h-auto h-[92vh] gap-[1vh] mx-[1vw]">
      {/* Navegação alinhada com as margens */}
      <nav className="my-[1vh]">
        <span className="text-sm text-gray-500">
          {' / '}
          <span className="font-medium text-gray-700">Dashboard</span>
        </span>
      </nav>

      {/* Contêiner principal */}
      <div className="flex flex-col gap-[6vh]">
        
        {/* CARDS SUPERIORES */}
        <div>
          <div className="flex justify-between ">
            <div className={`${cardInfo} bg-gray-50 border-gray-800`}>
              <div className={`${cardText}`}>
                <h3 className={`${cardNum} text-2xl`}>{TotalAlunos}</h3>
                <p className="text_total_alunos">Total de Alunos</p>
              </div>
              <div className={`${cardIcon}`}>
                <img src={totalAlunosIcon} alt="" className="w-10" />
              </div>
            </div>
            <div className={`${cardInfo} bg-gray-50 border-gray-800`}>
              <div className={`${cardText}`}>
                <h3 className={`${cardNum}`}>{TotalTurmas}</h3>
                <p className="text_total_alunos">Turmas Ativas</p>
              </div>
              <div className={`${cardIcon}`}>
                <img src={turmasAtivasIcon} alt="" className="w-10" />
              </div>
            </div>
            <div className={`${cardInfo} bg-green-50 border-green-600`}>
              <div className={`${cardText} text-green-600`}>
                <h3 className={`${cardNum}`}>{totalSituacaoNormal}</h3>
                <p className="text_situacao_normal">Situação Normal</p>
              </div>
              <div className={`${cardIcon}`}>
                <img src={situacaoNormalIcon} alt="" className="w-10" />
              </div>
            </div>
            <div className={`${cardInfo} bg-yellow-50 border border-yellow-600`}>
              <div className={`${cardText} text-yellow-600`}>
                <h3 className={`${cardNum}`}>{intObservacoes}</h3>
                <p className="text_restritos">Total Observações (BD)</p>
              </div>
              <div className={`${cardIcon}`}>
                <img src={restritosIcon} alt="" className="w-10" />
              </div>
            </div>
            <div className={`${cardInfo} bg-red-50 border border-red-600`}>
              <div className={`${cardText} text-red-600`}>
                <h3 className={`${cardNum}`}>{totalRestritos}</h3>
                <p className="text_retidos">Alunos Restritos</p>
              </div>
              <div className={`${cardIcon}`}>
                <img src={retidosIcon} alt="" className="w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICOS - Adicionado mb-10 para forçar o espaçamento com o final da página */}
        <div className="flex flex-row h-auto min-h-[25vh] gap-[2vh] w-full my-[1vh] mr-[1vw] font-sans antialiased">
          
          {/* 1. Gráfico de Rosca (Aproveitamento) */}
          <div className="bg-white border-2 border-gray-800 rounded-xl p-6 shadow-[0_0_2px_black] w-2/5 flex flex-col justify-center items-center min-h-[45vh] max-h-[45vh] ">
          {motivosData?.labels?.length > 0 ? ( // <-- ADICIONAMOS AS INTERROGAÇÕES AQUI
            <Doughnut data={motivosData} options={motivosOptions} />
          ) : (
            <p className="text-gray-500">Carregando dados do gráfico...</p>
          )}
          </div>

          {/* 2. Gráfico de Barras (Ranking Turmas) */}
          <div className="bg-white border-2 border-gray-800 rounded-xl shadow-[0_0_2px_black] p-6 w-3/5 flex flex-col justify-between min-h-[45vh] max-h-[45vh] ">
            
            {/* Título */}
            <div className="text-center min-h-[5vh]">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                RANKING - Turmas com Maior Índice de Retenção
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                % de alunos retidos por turma - ciclo 2026/1
              </p>
            </div>

            {/* Container do Gráfico */}
            <div className="relative w-full my-[0.5vh] flex h-[25vh]">
              <Bar data={rankingData} options={rankingOptions} />
            </div>

            {/* Legenda Customizada */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 font-medium h-[5vh]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#7c3aed]"></div> {'>'}50% Crítico</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#f97316]"></div> 25%-49% Alto</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#06b6d4]"></div> 10%-24% Médio</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-[#4ade80]"></div> {'<'}9% Normal</div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
