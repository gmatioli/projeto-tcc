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
 
  return (
    <section className="h-[calc(100vh-8vh)]">
      <div className="bg-[var(--sidebar_bg)] w-[20vw] h-full flex flex-col border-r border-[#ccc] overflow-hidden">
 
        <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4">
 
          {/* BOTÃO TURMAS */}
          <button
            onClick={toggleTurmas}
            className={`flex items-center justify-between w-full h-[10vh] px-5 mx-auto bg-[var(--button_bg)] rounded-[10px] font-bold border border-black text-[22px] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'turmas' || menuTurmasAberto ? 'bg-[#df3535] text-white' : ''
            }`}
          >
            <img
              src={councilIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'turmas' || menuTurmasAberto ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Turmas"
            />
            <p className="flex-1 text-center">Turmas</p>
            <img
              src={arrowRightIcon}
              className={`w-5 h-5 transition-transform duration-300 ${menuTurmasAberto ? '[transform:rotate(90deg)]' : '[transform:rotate(0deg)]'} ${botaoSelecionado === 'turmas' || menuTurmasAberto ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Seta"
            />
          </button>
 
          {/* SUBMENU FILTRO DE TURMAS */}
          {menuTurmasAberto && (
            <div className="flex flex-col gap-3 border-l-2 border-[#df3535] pl-4 ml-1 mt-3 mb-2">
 
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Tipo de Curso:</label>
                <select
                  value={tipoSelecionado}
                  onChange={handleMudarTipo}
                  className="p-2 rounded border border-[#ccc] bg-white text-sm outline-none focus:border-[#df3535]"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {tiposCursos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Curso:</label>
                <select
                  value={cursoSelecionado}
                  onChange={handleMudarCurso}
                  disabled={!tipoSelecionado}
                  className="p-2 rounded border border-[#ccc] bg-white text-sm outline-none focus:border-[#df3535] disabled:opacity-50"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {cursosDisponiveis.map(curso => (
                    <option key={curso} value={curso}>{curso}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Turma:</label>
                <select
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                  disabled={!cursoSelecionado}
                  className="p-2 rounded border border-[#ccc] bg-white text-sm outline-none focus:border-[#df3535] disabled:opacity-50"
                >
                  <option value="" disabled hidden>Selecione</option>
                  {turmasDisponiveis.map(item => (
                    <option key={item.idTurma} value={item.idTurma}>{item.turma}</option>
                  ))}
                </select>
              </div>
 
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleLimpar}
                  className="flex-1 p-2 bg-[#ea4335] text-white rounded text-sm font-semibold hover:brightness-90 transition-all"
                >
                  Limpar ⟲
                </button>
                <button
                  onClick={handlePesquisar}
                  className="flex-1 p-2 bg-[#ea4335] text-white rounded text-sm font-semibold hover:brightness-90 transition-all"
                >
                  Pesquisar 🔍
                </button>
              </div>
            </div>
          )}
 
          {/* BOTÃO INSTR. DE ACOMP. */}
          <button
            onClick={handleInstrAcomp}
            className={`flex items-center justify-between w-full h-[10vh] px-5 mx-auto mt-4 bg-[var(--button_bg)] rounded-[10px] border border-black font-bold text-[22px] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'instr' ? 'bg-[#df3535] text-white' : ''
            }`}
          >
            <img
              src={reportIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'instr' ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Instrumento"
            />
            <p className="flex-1 text-center">Instr. de Acomp.</p>
            <img
              src={arrowRightIcon}
              className={`w-5 h-5 ${botaoSelecionado === 'instr' ? 'brightness-0 invert' : 'brightness-0'}`}
              alt="Seta"
            />
          </button>
 
        </div>
 
        {/* CONFIGURAÇÕES */}
        <div className="w-full flex justify-center border-t border-[#ccc]">
          <button
            onClick={handleConfig}
            className={`flex items-center justify-center w-full h-[60px] px-5 font-bold text-[20px] cursor-pointer transition-all gap-3 ${
              botaoSelecionado === 'config' ? 'bg-[#df3535] text-white' : 'bg-[var(--button_bg)]'
            }`}
          >
            <img
              src={configIcon}
              className={`w-5 h-5 ${botaoSelecionado === 'config' ? 'brightness-0 invert' : ''}`}
              alt="Configurações"
            />
            <p>Config. Perfil</p>
          </button>
        </div>
 
      </div>
    </section>
  );
}