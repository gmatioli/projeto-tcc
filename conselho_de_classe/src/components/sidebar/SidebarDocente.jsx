import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API } from '../../config/api';

import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';
 
export function SidebarDocente() {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [menuTurmasAberto, setMenuTurmasAberto] = useState(false);
  const [dadosCompletos, setDadosCompletos] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
 
  const [botaoSelecionado, setBotaoSelecionado] = useState(null);
 
  useEffect(() => {
    fetch(API.turmasFiltro)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) setDadosCompletos(data.dados);
      })
      .catch(err => console.error('Erro ao buscar turmas:', err));
  }, []);
 
  const tiposCursos = [...new Set(dadosCompletos.map(item => item.tipo))];
  const cursosFiltrados = dadosCompletos.filter(item => item.tipo === tipoSelecionado);
  const cursosDisponiveis = [...new Set(cursosFiltrados.map(item => item.curso))];
  const turmasDisponiveis = dadosCompletos.filter(
    item => item.curso === cursoSelecionado && item.tipo === tipoSelecionado
  );
 
  const handleMudarTipo = (e) => {
    setTipoSelecionado(e.target.value);
    setCursoSelecionado('');
    setTurmaSelecionada('');
  };
 
  const handleMudarCurso = (e) => {
    setCursoSelecionado(e.target.value);
    setTurmaSelecionada('');
  };
 
  const handleLimpar = () => {
    setTipoSelecionado('');
    setCursoSelecionado('');
    setTurmaSelecionada('');
  };
 
  const handlePesquisar = () => {
    if (!turmaSelecionada) {
      alert('Por favor, selecione uma Turma antes de pesquisar.');
      return;
    }
    navigate(`/docente/turmas?turma=${turmaSelecionada}`);
  };
 
  const toggleTurmas = () => {
    const novoEstado = !menuTurmasAberto;
    setMenuTurmasAberto(novoEstado);
    if (novoEstado) {
      setBotaoSelecionado('turmas');
    } else {
      setBotaoSelecionado(null);
    }
  };
 
  const handleInstrAcomp = () => {
    setBotaoSelecionado('instr');
    setMenuTurmasAberto(false);
    navigate('/docente/instrumento-acompanhamento');
  };
 
  const handleConfig = () => {
    setBotaoSelecionado('config');
    navigate('/perfil');
  };
 
  const formIncompleto = !turmaSelecionada || !cursoSelecionado || !tipoSelecionado;
 
  return (
    <section className="h-[calc(100vh-8vh)]">
      <div className="bg-gray-200 w-[20vw] h-full flex flex-col border-r border-[#ccc] overflow-hidden">
 
        <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 custom-scrollbar">
 
          {/* BOTÃO TURMAS */}
          <button
            onClick={toggleTurmas}
            className={`flex items-center justify-center gap-4 w-full h-[10vh] px-10 mx-auto bg-gray-100 rounded-[10px] font-bold border border-black text-[26px] shadow-[0px_3px_7px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'turmas' || menuTurmasAberto ? 'bg-[var(--button-selected)] text-white' : ''
            }`}
          >
            <img
              src={councilIcon}
              className={`w-7 h-7 ${botaoSelecionado === 'turmas' || menuTurmasAberto ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Turmas"
            />
            <p className="flex-1 text-center">Turmas</p>
            <img
              src={arrowRightIcon}
              className={`w-6 h-6 transition-transform duration-300 ${menuTurmasAberto ? '[transform:rotate(90deg)]' : '[transform:rotate(0deg)]'} ${botaoSelecionado === 'turmas' || menuTurmasAberto ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Seta"
            />
          </button>
 
          {/* SUBMENU FILTRO DE TURMAS */}
          {menuTurmasAberto && (
            <div className="flex flex-col gap-[12px] border-l-[2px] border-[var(--button-selected)] pl-[15px] ml-[5px] mt-3 mb-[10px]">
 
              <div className="flex flex-col text-left gap-[5px]">
                <label className="text-xl font-medium text-[#333]">Tipo de Curso:</label>
                <select
                  value={tipoSelecionado}
                  onChange={handleMudarTipo}
                  className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-lg outline-none focus:border-[var(--button-selected)]"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {tiposCursos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex flex-col text-left gap-[5px]">
                <label className="text-xl font-medium text-[#333]">Curso:</label>
                <select
                  value={cursoSelecionado}
                  onChange={handleMudarCurso}
                  disabled={!tipoSelecionado}
                  className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-lg outline-none focus:border-[var(--button-selected)] disabled:opacity-50"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {cursosDisponiveis.map(curso => (
                    <option key={curso} value={curso}>{curso}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex flex-col text-left gap-[5px]">
                <label className="text-xl font-medium text-[#333]">Turma:</label>
                <select
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                  disabled={!cursoSelecionado}
                  className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-lg outline-none focus:border-[var(--button-selected)] disabled:opacity-50"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {turmasDisponiveis.map(item => (
                    <option key={item.idTurma} value={item.idTurma}>{item.turma}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex gap-[10px] mt-[5px]">
                <button
                  onClick={handleLimpar}
                  className="flex-1 p-[10px] bg-[var(--button-selected)] text-white rounded-[5px] text-lg font-semibold hover:brightness-90 transition-all"
                >
                  Limpar ⟲
                </button>
                <button
                  onClick={handlePesquisar}
                  disabled={formIncompleto}
                  className={`flex-1 p-[10px] rounded-[5px] text-lg font-semibold transition-all
                    ${formIncompleto ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'bg-[var(--button-selected)] text-white cursor-pointer hover:brightness-90'}`}
                >
                  Pesquisar
                </button>
              </div>
            </div>
          )}
 
          {/* BOTÃO INSTR. DE ACOMP. */}
          <button
            onClick={handleInstrAcomp}
            className={`flex items-center justify-center gap-4 w-full h-[10vh] px-10 mx-auto mt-4 bg-gray-100 rounded-[10px] border border-black font-bold text-[26px] shadow-[0px_3px_7px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'instr' ? 'bg-[var(--button-selected)] text-white' : ''
            }`}
          >
            <img
              src={reportIcon}
              className={`w-7 h-7 ${botaoSelecionado === 'instr' ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Instrumento"
            />
            <p className="flex-1 text-center">Instr. de Acomp.</p>
            <img
              src={arrowRightIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'instr' ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Seta"
            />
          </button>
 
        </div>
 
        {/* CONFIGURAÇÕES */}
        <div className="w-full flex justify-center border-t border-[#ccc]">
          <button
            onClick={handleConfig}
            className={`flex items-center justify-center w-full h-[70px] px-[20px] bg-gray-100 border shadow-[0px_-3px_7px_rgb(150,150,150)] font-bold text-[26px] cursor-pointer transition-all gap-[15px] ${
              botaoSelecionado === 'config' ? 'bg-[var(--button-selected)] text-white border border-[var(--button-selected)]' : ''
            }`}
          >
            <img
              src={configIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'config' ? 'brightness-0 invert' : ''}`}
              alt="Configurações"
            />
            <p>Config. Perfil</p>
          </button>
        </div>
 
      </div>
    </section>
  );
}