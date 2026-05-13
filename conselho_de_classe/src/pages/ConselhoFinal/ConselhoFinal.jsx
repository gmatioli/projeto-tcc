import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'

import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg';
import ModalJustificativa from '../../components/modalJustificativa/ModalJustificativa.jsx';

const intObservacoes = 3

// Variável para evitar repetição nas células de tabela padronizadas
const tableThClasses = "border border-[#ddd] p-[12px_15px] text-left font-bold bg-white sticky top-0 z-10";
const tableTdClasses = "border border-[#ddd] p-[12px_15px] text-left text-lg";
const btnClasses = "border border-black shadow-[3px_3px_5px_gray]"

const ConselhoFinal = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parâmetros vindos da Sidebar (FormConselhoFinal)
  const areaSelecionada = searchParams.get('area');
  const cursoSelecionado = searchParams.get('curso');
  
  // Estados
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarTabelaAlunos, setMostrarTabelaAlunos] = useState(false);
  
  // Usuário logado vindo do localStorage (para registrar quem iniciou)
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  const idUsuario = usuario.idUsuario;

  // Filtramos os alunos que possuem justificativa para mostrar na tabela lateral 
  const alunosComJustificativa = alunos.filter(aluno => aluno.temJustificativa);

  const [isModalJustificativaOpen, setIsModalJustificativaOpen] = useState(false);

  // 1) Carrega turmas baseado em área e curso selecionados na Sidebar
  useEffect(() => {
    if (!areaSelecionada || !cursoSelecionado) return;

    setCarregando(true);
    setTurmaSelecionada(null);
    setAlunos([]);
    setMostrarTabelaAlunos(false);

    fetch(`http://localhost:3001/api/turmas-filtro?area=${encodeURIComponent(areaSelecionada)}&curso=${encodeURIComponent(cursoSelecionado)}`)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && Array.isArray(data.dados)) {
          const turmasFiltradas = data.dados.filter(turma => turma.curso === cursoSelecionado);

          setTurmas(turmasFiltradas);
        } else {
          setTurmas([]);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar turmas:', err);
        setTurmas([]);
      })
      .finally(() => setCarregando(false));
  }, [areaSelecionada, cursoSelecionado]);

  // 2) Carrega alunos quando uma turma é selecionada e o usuário clica em "Avaliar turma"
  const handleAvaliarTurma = async () => {
    if (!turmaSelecionada) {
      alert('Selecione uma turma para avaliar.');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch(`http://localhost:3001/api/alunos/${turmaSelecionada}`);
      const data = await res.json();
      if (data.sucesso && Array.isArray(data.alunos)) {
        setAlunos(data.alunos);
        setMostrarTabelaAlunos(true);
      } else {
        alert('Erro ao carregar alunos da turma.');
      }
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      alert('Erro ao carregar alunos da turma.');
    } finally {
      setCarregando(false);
    }
  };

  const handleOpenModalJustificativa = () => setIsModalJustificativaOpen(true);
  const handleCloseModalJustificativa = () => setIsModalJustificativaOpen(false);



  return (
    <div id="conselho-tables-container" className="flex flex-col gap-2">

      {/* Barra subtitulo */}
      <nav>
        <span className="text-sm text-gray-500">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:underline text-gray-500"
          >
            Conselhos
          </button>
          {' / '}
          <span className="font-medium text-gray-700">Conselho Final</span>
        </span>
      </nav>

      {/* SEÇÃO SUPERIOR: TURMAS + JUSTIFICATIVAS LADO A LADO */}
      <section className="flex gap-[15px] items-start w-full mb-6">
        
        {/* Tabela de Turmas (Esquerda - flex 1.3) */}
        <div className="flex-1 max-h-[180px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className={`${tableThClasses}`}>Turma(s)</th>
                <th className={`${tableThClasses}`}>Pré Conselho</th>
                <th className={`${tableThClasses}`}>Conselho Final</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="3" className={`${tableTdClasses} text-center text-gray-500`}>
                    Carregando turmas...
                  </td>
                </tr>
              ) : turmas.length > 0 ? (
                turmas.map(turma => (
                  <tr key={turma.idTurma}>
                    <td className={`${tableTdClasses}`}>
                      <label className='flex items-center gap-2 m-0 cursor-pointer'>
                        <input 
                          type="radio" 
                          name="turma" 
                          checked={turmaSelecionada === turma.idTurma}
                          onChange={() => setTurmaSelecionada(turma.idTurma)}
                        /> 
                        {turma.turma}
                      </label>
                    </td>
                    <td className={`${tableTdClasses}`}>{turma.preConselho}</td>
                    <td className={`${tableTdClasses}`}>{turma.preConselho}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={`${tableTdClasses} text-center text-gray-500`}>
                    Nenhuma turma encontrada. Selecione área e curso na Sidebar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tabela de Justificativas (Direita - flex 1) */}
        <div className="flex-1 max-h-[180px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className={`${tableThClasses} w-[40%]`}>Aluno</th>
                <th className={`${tableThClasses} w-[60%]`}>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {alunosComJustificativa.length > 0 ? (
                alunosComJustificativa.map(aluno => (
                  <tr key={`just-${aluno.id}`}>
                    <td className={`${tableTdClasses} font-bold text-[12px]`}>
                      {aluno.nome}
                    </td>
                    <td className={`${tableTdClasses} text-[#555] italic text-[12px]`}>
                      {aluno.textoJustificativa}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className={`${tableTdClasses} text-center text-[#555] italic`}>
                    Nenhuma justificativa na turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Botões de Ação (Extrema Direita) */}
        <div className="flex flex-col justify-center gap-[15px] w-[150px] shrink-0 h-[180px] ">
          <button 
            onClick={handleAvaliarTurma}
            disabled={!turmaSelecionada || carregando}
            className={`${btnClasses} p-[10px] rounded-[20px] font-bold text-center transition-all ${
              !turmaSelecionada || carregando 
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                : 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
            }`}>
            {carregando ? 'Carregando...' : 'Avaliar turma'}
          </button>
          <button className={`${btnClasses} bg-gray-400 text-white p-[10px] rounded-[20px] font-bold text-center`}>
            Salvar
          </button>
        </div>

      </section>

      {/* SEÇÃO INFERIOR: ALUNOS GERAL - RENDERIZADO CONDICIONALMENTE */}
      {mostrarTabelaAlunos && (
      <section className='h-[64vh] overflow-y-auto'>
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr>
              <th className={`${tableThClasses}`}>Alunos</th>
              <th className={`${tableThClasses}`}>Pré Conselho</th>
              <th className={`${tableThClasses}`}>Conselho final</th>
              <th className={`${tableThClasses}`}>Avaliação Situação Final</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.idtblAluno}>
                <td className={`${tableTdClasses} `}>{aluno.nome}</td>
                <td className={`${tableTdClasses} `}>
                  <p>-</p>
                  <button className="text-gray-500 text-xs mt-[5px] hover:underline">
                    <div className="flex items-center my-0 mx-1 gap-1">
                      <img src={notificationIcon} alt="" className="w-6 h-6 border border-yellow-600 rounded-full p-[1px]"/>
                      <div className='flex'>
                          <p className="text-m underline">Ver Observações</p>
                          <p className="text-m underline">({intObservacoes})</p>
                      </div>
                  </div>
                  </button>
                </td>
                <td className={`${tableTdClasses} text-center `}>
                  {aluno.temJustificativa ? (
                    <button onClick={handleOpenModalJustificativa} className=" text-orange-600 px-2 py-1 rounded text-lg underline font-bold ">
                      Ver contestação
                    </button>
                  ) : '-'}
                </td>
                <td className={`${tableTdClasses} flex flex-col gap-2 items-center p-2`}>
                  
                  {/* Botões de Status com renderização condicional de classes */}
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'aprovado' ? 'bg-green-500' : 'bg-gray-400'}`}>
                    Aprovado
                  </button>
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'aprovado-conselho' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                    Aprovado pelo Conselho
                  </button>
                  <button className={`${btnClasses} w-full max-w-[250px] p-[6px] rounded-[15px] font-bold text-[17px] text-white ${aluno.status === 'reprovado' ? 'bg-red-500' : 'bg-gray-400'}`}>
                    Reprovado
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
      <ModalJustificativa isOpen={isModalJustificativaOpen} onClose={handleCloseModalJustificativa} />
    </div>
  );
};

export default ConselhoFinal;