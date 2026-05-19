import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API } from '../../config/api';

import dashboardIcon from '../../assets/sidebar/dashboard-icon.svg';
import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';

function FormFiltros({ rotaDestino, onFechar }) {
  const navigate = useNavigate();

  const [dadosCompletos, setDadosCompletos] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [cursoSelecionado, setCursoSelecionado] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");

  const formIncompleto = !turmaSelecionada || !cursoSelecionado || !tipoSelecionado;

  useEffect(() => {
    fetch(API.turmasFiltro)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && Array.isArray(data.dados)) setDadosCompletos(data.dados);
      })
      .catch(() => {});
  }, []);

  const tiposCursos = [...new Set(dadosCompletos.map(item => item.tipo))];
  const cursosFiltrados = dadosCompletos.filter(item => item.tipo === tipoSelecionado);
  const cursosDisponiveis = [...new Set(cursosFiltrados.map(item => item.curso))];
  const turmasDisponiveis = dadosCompletos.filter(item => item.curso === cursoSelecionado && item.tipo === tipoSelecionado);

  const handleMudarTipo = (e) => {
    setTipoSelecionado(e.target.value);
    setCursoSelecionado("");
    setTurmaSelecionada("");
  };

  const handleMudarCurso = (e) => {
    setCursoSelecionado(e.target.value);
    setTurmaSelecionada("");
  };

  const handlePesquisar = () => {
    const turmaObj = turmasDisponiveis.find(t => t.idTurma.toString() === turmaSelecionada.toString());
    const nomeDaTurma = turmaObj ? turmaObj.turma : '';
    navigate(`${rotaDestino}?turma=${turmaSelecionada}&nomeTurma=${encodeURIComponent(nomeDaTurma)}&modo=pesquisa`);
    onFechar();
  };

  const handleLimparFiltro = () => {
    setTipoSelecionado("");
    setCursoSelecionado("");
    setTurmaSelecionada("");
  };

  return (
    <div className="flex flex-col gap-[12px] border-l-[2px] border-[var(--button-selected)] pl-[15px] ml-[5px] mb-[10px]">
      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-xl font-medium text-[#333]">Tipo de Curso:</label>
        <select className="p-[8px] rounded-[5px] border-2 border-gray-300 bg-white text-lg outline-none focus:border-[var(--button-selected)]"
          value={tipoSelecionado}
          onChange={handleMudarTipo}
        >
          <option value="" disabled hidden>Selecione</option>
          {tiposCursos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-xl font-medium text-[#333]">Curso:</label>
        <select className="p-[8px] rounded-[5px] border-2 border-gray-300 bg-white text-lg outline-none focus:border-[var(--button-selected)]"
          value={cursoSelecionado}
          onChange={handleMudarCurso}
          disabled={!tipoSelecionado}
        >
          <option value="" disabled hidden>Selecione</option>
          {cursosDisponiveis.map(curso => (
            <option key={curso} value={curso}>{curso}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-xl font-medium text-[#333]">Turma:</label>
        <select className="p-[8px] rounded-[5px] border-2 border-gray-300 bg-white text-lg outline-none focus:border-[var(--button-selected)]"
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
          disabled={!cursoSelecionado}
        >
          <option value="" disabled hidden>Selecione</option>
          {turmasDisponiveis.map(item => (
            <option key={item.idTurma} value={item.idTurma}>{item.turma}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-[10px] mt-[5px]">
        <button onClick={handleLimparFiltro} className="flex-1 p-[10px] bg-[var(--button-selected)] text-white rounded-[5px] text-lg font-semibold hover:brightness-90 transition-all">
          Limpar ⟲
        </button>
        <button
          onClick={handlePesquisar}
          disabled={formIncompleto}
          className={`flex-1 p-[10px] rounded-[5px] text-lg font-semibold transition-all
            ${formIncompleto ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'bg-[var(--button-selected)] text-white cursor-pointer hover:brightness-90'}`}>
          Pesquisar
        </button>
      </div>
  
    </div>
  );
}

function FormConselhoFinal({ rotaDestino, onFechar }) {
  const navigate = useNavigate();

  const [dadosCompletos, setDadosCompletos] = useState([]);
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [cursoSelecionado, setCursoSelecionado] = useState("");

  const formIncompleto = !areaSelecionada || !cursoSelecionado;

  useEffect(() => {
    fetch(API.turmasFiltro)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso && Array.isArray(data.dados)) setDadosCompletos(data.dados);
      })
      .catch(() => {});
  }, []);

  const areaCurso = [...new Set(dadosCompletos.map(item => item.area))];
  const cursosFiltrados = dadosCompletos.filter(item => item.area === areaSelecionada);
  const cursosDisponiveis = [...new Set(cursosFiltrados.map(item => item.curso))];

  const handleMudarArea = (e) => {
    setAreaSelecionada(e.target.value);
    setCursoSelecionado("");
  };

  const handleMudarCurso = (e) => {
    setCursoSelecionado(e.target.value);
  };


  const handlePesquisar = () => {
    navigate(`${rotaDestino}?area=${encodeURIComponent(areaSelecionada)}&curso=${encodeURIComponent(cursoSelecionado)}&modo=pesquisa`);
    onFechar();
  };

  const handleLimparFiltro = () => {
    setAreaSelecionada("");
    setCursoSelecionado("");
  };

  return (
    <div className="flex flex-col gap-[12px] border-l-[2px] border-[var(--button-selected)] pl-[15px] ml-[5px] mb-[10px]">
      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-xl font-medium text-[#333]">Área curso:</label>
        <select className="p-[8px] rounded-[5px] border-2 border-gray-300 bg-white text-lg outline-none focus:border-[var(--button-selected)]"
          value={areaSelecionada}
          onChange={handleMudarArea}
        >
          <option value="" disabled hidden>Selecione</option>
          {areaCurso.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-xl font-medium text-[#333]">Curso:</label>
        <select className="p-[8px] rounded-[5px] border-2 border-gray-300 bg-white text-lg outline-none focus:border-[var(--button-selected)]"
          value={cursoSelecionado}
          onChange={handleMudarCurso}
          disabled={!areaSelecionada}
        >
          <option value="" disabled hidden>Selecione</option>
          {cursosDisponiveis.map(curso => (
            <option key={curso} value={curso}>{curso}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-[10px] mt-[5px]">
        <button onClick={handleLimparFiltro} className="flex-1 p-[10px] bg-[var(--button-selected)] text-white rounded-[5px] text-lg font-semibold hover:brightness-90 transition-all">
          Limpar ⟲
        </button>
        <button onClick={handlePesquisar} disabled={formIncompleto}
          className={`flex-1 p-[10px] rounded-[5px] text-lg font-semibold transition-all
            ${formIncompleto ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'bg-[var(--button-selected)] text-white cursor-pointer hover:brightness-90'}`}>
          Pesquisar
        </button>
      </div>
      
    </div>
  );
}
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [botaoSelecionado, setBotaoSelecionado] = useState(null);
  const [menuConselhoAberto, setMenuConselhoAberto] = useState(false);
  const [abaAberta, setAbaAberta] = useState(null);
  const [menuRelatorioAberto, setMenuRelatorioAberto] = useState(false);

  const toggleAba = (aba) => {
    setAbaAberta(abaAberta === aba ? null : aba);
  };

  const fecharMenuConselho = () => {
    setAbaAberta(null);
    setMenuConselhoAberto(false);
  };

  const toggleMenuConselho = () => {
    const novoEstado = !menuConselhoAberto;
    setMenuConselhoAberto(novoEstado);

    if (novoEstado) {
      setBotaoSelecionado('conselhos');
      setMenuRelatorioAberto(false);
    } else {
      setBotaoSelecionado(null);
    }

    if (!novoEstado) setAbaAberta(null);
  };

  const toggleMenuRelatorio = () => {
    const novoEstado = !menuRelatorioAberto;
    setMenuRelatorioAberto(novoEstado);

    if (novoEstado) {
      setBotaoSelecionado('relatorios');
      setMenuConselhoAberto(false);
      setAbaAberta(null);
    } else {
      setBotaoSelecionado(null);
    }
  };

  const handleClick = (rota, nomeBotao) => {
    navigate(rota);
    setMenuConselhoAberto(false);
    setMenuRelatorioAberto(false);
    setAbaAberta(null);
    setBotaoSelecionado(botaoSelecionado === nomeBotao ? null : nomeBotao);
  };

  return (
    <section className="h-[calc(100vh-8vh)]">
      <div className="bg-gray-200 max-w-[20vw] h-full flex flex-col border-r-2 border-gray-300 overflow-hidden">

        <div className="flex-1 overflow-y-auto pt-6 px-[0.5vw] pb-4 custom-scrollbar">

          <button
            onClick={() => handleClick('/dashboard', 'dashboard')}
            className={`flex items-center justify-center min-w-[18vw] min-h-[10vh] text-[1.625rem] max-px-[0.5vw] mx-auto mt-[2vh] bg-gray-100 rounded-[10px] border-2 border-gray-700 font-bold shadow-[0px_3px_7px_rgb(117,117,117)] cursor-pointer transition-all sm:gap-[0.1vh] md:gap-[0.5vh] lg:gap-[1vh] xl:gap-[3vh] ${
              botaoSelecionado === 'dashboard' ? 'bg-[var(--button-selected)] text-white' : ''
            }`}>
            <img src={dashboardIcon} className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} alt="Dashboard" />
            <p className="flex text-center ">Dashboard</p>
            <img src={arrowRightIcon} className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} alt="Seta" />
          </button>

          {/* CONSELHOS */}
          <button
            onClick={toggleMenuConselho}
            className={`flex items-center justify-center min-w-[18vw] min-h-[10vh] text-[1.625rem] max-px-[0.5vw] mx-auto mt-[2vh] bg-gray-100 rounded-[10px] border-2 border-gray-700 font-bold shadow-[0px_3px_7px_rgb(117,117,117)] cursor-pointer transition-all sm:gap-[0.1vh] md:gap-[0.5vh] lg:gap-[1vh] xl:gap-[3vh] ${
              botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'bg-[var(--button-selected)] text-white' : ''
            }`}>
            <img src={councilIcon} className={`w-7 h-7 ${botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'brightness-0 invert' : 'brightness-0'}`} alt="Conselhos" />
            <p className="flex text-center">Conselhos</p>
            <img
              src={arrowRightIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'brightness-0 invert' : 'brightness-0'} transition-transform duration-300 ${menuConselhoAberto ? '[transform:rotate(90deg)]' : '[transform:rotate(0deg)]'}`}
              alt="Seta"
            />
          </button>

          {/* SUBMENU CONSELHOS */}
          {menuConselhoAberto && (
            <div className="flex flex-col w-full mx-auto mt-[10px] gap-2">
              <button
                onClick={() => toggleAba('intermediario')}
                className={`w-full py-3 px-2 rounded-[8px] border-2 border-gray-500 text-xl font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  abaAberta === 'intermediario' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-500 shadow-xl' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Conselho Intermediário
              </button>
              {abaAberta === 'intermediario' && <FormFiltros rotaDestino="/conselhointermediario" onFechar={fecharMenuConselho} />}

              <button
                onClick={() => toggleAba('pre')}
                className={`w-full py-3 px-4 rounded-[8px] border-2 border-gray-500 text-xl font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  abaAberta === 'pre' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-500 shadow-lg' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Pré-Conselho
              </button>
              {abaAberta === 'pre' && <FormFiltros rotaDestino="/preconselho" onFechar={fecharMenuConselho} />}

              <button
                onClick={() => toggleAba('final')}
                className={`w-full py-3 px-4 rounded-[8px] border-2 border-gray-500 text-xl font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  abaAberta === 'final' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-500 shadow-lg' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Conselho Final
              </button>
              {abaAberta === 'final' && <FormConselhoFinal rotaDestino="/conselhofinal" onFechar={fecharMenuConselho} />}
            </div>
          )}

          {/* RELATÓRIOS */}
          <button
            onClick={toggleMenuRelatorio}
            className={`flex items-center justify-center min-w-[18vw] min-h-[10vh] text-[1.625rem] max-px-[0.5vw] mx-auto mt-[2vh] bg-gray-100 rounded-[10px] border-2 border-gray-700 font-bold shadow-[0px_3px_7px_rgb(117,117,117)] cursor-pointer transition-all sm:gap-[0.1vh] md:gap-[0.5vh] lg:gap-[1vh] xl:gap-[3vh] ${
              botaoSelecionado === 'relatorios' || menuRelatorioAberto ? 'bg-[var(--button-selected)] text-white' : ''
            }`}>
              <img src={reportIcon} className={`w-7 h-7 ${botaoSelecionado === 'relatorios' || menuRelatorioAberto ? 'brightness-0 invert' : 'brightness-0'}`} alt="Relatórios" />
              <p className=" text-center">Relatórios</p>
              <img
                src={arrowRightIcon}
                className={`w-6 h-6 ${botaoSelecionado === 'relatorios' || menuRelatorioAberto ? 'brightness-0 invert' : 'brightness-0'} transition-transform duration-300 ${menuRelatorioAberto ? '[transform:rotate(90deg)]' : '[transform:rotate(0deg)]'}`}
                alt="Seta"
              />
          </button>

          {/* SUBMENU RELATÓRIOS */}
          {menuRelatorioAberto && (
            <div className="flex flex-col w-full mx-auto mt-[10px] gap-2">
              <button
                onClick={() => navigate('/relatorios/ata')}
                className={`w-full py-3 px-4 rounded-[8px] border-2 border-gray-500 text-lg font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/ata' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-700 shadow-lg' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Gerar Ata
              </button>

              <button
                onClick={() => navigate('/relatorios/relatorio')}
                className={`w-full py-3 px-4 rounded-[8px] border-2 border-gray-500 text-lg font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/relatorio' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-700 shadow-lg' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Gerar Relatório
              </button>

              <button
                onClick={() => navigate('/relatorios/termo')}
                className={`w-full py-3 px-4 rounded-[8px] border-2 border-gray-500 text-lg font-medium transition-all shadow-lg text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/termo' ? 'bg-[var(--button-selected)] text-white border-2 border-gray-700 shadow-lg' : 'bg-gray-100 border-gray-300 hover:bg-gray-300'
                }`}>
                Gerar Termo de Ciência
              </button>
            </div>
          )}

        </div>

        <div className="w-full flex justify-center border-t-2 border-gray-300">
          <button
            onClick={() => handleClick('/configuracoes', 'configuracoes')}
            className={`flex items-center justify-center w-full h-[70px] px-[20px] bg-gray-100 border-2 shadow-[0px_-3px_7px_rgb(150,150,150)] font-bold text-[26px] cursor-pointer transition-all gap-[15px] ${
              botaoSelecionado === 'configuracoes' ? 'bg-[var(--button-selected)] text-white border-2 border-[var(--button-selected)]' : ''
            }`}>
            <img
              src={configIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'configuracoes' ? 'brightness-0 invert' : ''}`}
              alt="Configurações"
            />
            <p>Configurações</p>
          </button>
        </div>

      </div>
    </section>
  );
}
