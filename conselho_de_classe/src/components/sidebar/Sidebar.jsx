import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import dashboardIcon from '../../assets/sidebar/dashboard-icon.svg';
import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar qual botão principal está selecionado
  const [botaoSelecionado, setBotaoSelecionado] = useState(null);

  const [menuConselhoAberto, setMenuConselhoAberto] = useState(false);
  const [abaAberta, setAbaAberta] = useState(null);

  // estado do submenu 'Relatorios'
  const [menuRelatorioAberto, setMenuRelatorioAberto] = useState(false);

  const toggleAba = (aba) => {
    setAbaAberta(abaAberta === aba ? null : aba);
  };

  const toggleMenuConselho = () => {
    const novoEstado = !menuConselhoAberto;
    setMenuConselhoAberto(novoEstado);
    
    // Comportamento toggle: seleciona conselho e fecha relatórios
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

    // Comportamento toggle: seleciona relatório e fecha conselhos
    if (novoEstado) {
      setBotaoSelecionado('relatorios');
      setMenuConselhoAberto(false);
      setAbaAberta(null);
    } else {
      setBotaoSelecionado(null);
    }
  };

  // Função para os outros botões (Dashboard, Configurações)
  const handleClick = (rota, nomeBotao) => {
    navigate(rota);
    
    // Fecha os submenus se clicar em botões que não tem dropdown
    setMenuConselhoAberto(false);
    setMenuRelatorioAberto(false);
    setAbaAberta(null);

    // Toggle: se já está selecionado, desmarca. Senão, seleciona.
    setBotaoSelecionado(botaoSelecionado === nomeBotao ? null : nomeBotao);
  };

  // Formulário de Filtros 
  const FormFiltros = ({ rotaDestino }) => {
    const navigate = useNavigate();

    // Guarda todos os dados vindos do banco
    const [dadosCompletos, setDadosCompletos] = useState([]);
    
    // Guarda o que o usuário selecionou em cada etapa
    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [cursoSelecionado, setCursoSelecionado] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    
    // Busca os dados do banco assim que o menu abre
    useEffect(() => {
      fetch('http://localhost:3001/api/turmas-filtro')
        .then(res => res.json())
        .then(data => {
          if (data.sucesso) setDadosCompletos(data.dados);
        });
    }, []);

    // 1. Extrai os tipos cursos existentes
    const tiposCursos = [...new Set(dadosCompletos.map(item => item.tipo))];

    // 2. Extrai os cursos de acordo com o tipo selecionado
    const cursosFiltrados = dadosCompletos.filter(item => item.tipo === tipoSelecionado);
    const cursosDisponiveis = [...new Set(cursosFiltrados.map(item => item.curso))];

    // 3. Extrai as turmas de acordo com o curso selecionado
    const turmasDisponiveis = dadosCompletos.filter(item => item.curso === cursoSelecionado && item.tipo === tipoSelecionado );

    // Função para limpar campos após filtro
    const handleMudarTipo = (e) => {
      setTipoSelecionado(e.target.value);
      setCursoSelecionado("");
      setTurmaSelecionada("");
    };

    const handleMudarCurso = (e) => {
      setCursoSelecionado(e.target.value);
      setTurmaSelecionada("");
    };

    const handleIniciarConselho = () => {
      if (!turmaSelecionada) {
        alert("Por favor, selecione uma Turma para iniciar o conselho!");
        return;
      }
      navigate(`${rotaDestino}?turma=${turmaSelecionada}`);
    };

    const handleLimparFiltro = () => {
      setTipoSelecionado("");
      setCursoSelecionado("");
      setTurmaSelecionada("");
    };



    
    return (
    <div className="flex flex-col gap-[12px] border-l-[2px] border-[#df3535] pl-[15px] ml-[5px] mb-[10px]">
      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-[0.9rem] font-medium text-[#333]">Tipo de Curso:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]"
          value={tipoSelecionado}
          onChange={handleMudarTipo}
        >
          <option value="" disabled hidden >Selecione</option>
          {tiposCursos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}

        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-[0.9rem] font-medium text-[#333]">Curso:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]"
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
        <label className="text-[0.9rem] font-medium text-[#333]">Turma:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]"
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
        <button className="flex-1 p-[10px] bg-[#ea4335] text-white rounded-[5px] text-[0.85rem] font-semibold hover:brightness-90 transition-all">
          Limpar Filtro ⟲
        </button>

        <button
          onClick={() => navigate(rotaDestino)}
          className="flex-1 p-[10px] bg-[#ea4335] text-white rounded-[5px] text-[0.85rem] font-semibold hover:brightness-90 transition-all">
          Iniciar Conselho
        </button>
      </div>
    </div>
  );
}


  return (
    <section className="h-[calc(100vh-8vh)]">
      <div className="bg-[var(--sidebar_bg)] w-[20vw] h-full flex flex-col border-r border-[#ccc] overflow-hidden">

      <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 custom-scrollbar">

          <button
            onClick={() => handleClick('/dashboard', 'dashboard')}
            className={`flex items-center justify-between w-full h-[10vh] px-4 mx-auto mt-0 bg-[var(--button_bg)] rounded-[10px] font-bold border border-black text-xl shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'dashboard' ? 'bg-[#df3535] text-white' : ''
            }`}>
            <img src={dashboardIcon} className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} alt="Dashboard" />
            
            <p className="flex-1 text-center">Dashboard</p>
            
            <img src={arrowRightIcon} className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} alt="Seta" />
          </button>

          {/* CONSELHOS */}
          <button
            onClick={toggleMenuConselho}
            className={`flex items-center justify-between w-full h-[10vh] px-4 mx-auto mt-4 bg-[var(--button_bg)] rounded-[10px] font-bold border border-black text-xl shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'bg-[#df3535] text-white' : ''
            }`}>
            <img src={councilIcon} className={`w-6 h-6 ${botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'brightness-0 invert' : 'brightness-0'}`} alt="Conselhos" />
            
            <p className="flex-1 text-center">Conselhos</p>
            
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
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500  text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  abaAberta === 'intermediario' ? 'bg-[#df3535] text-white border border-gray-500  shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Conselho Intermediário
              </button>
              {abaAberta === 'intermediario' && <FormFiltros rotaDestino="/conselhointermediario" />}

              <button
                onClick={() => toggleAba('pre')}
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500  text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  abaAberta === 'pre' ? 'bg-[#df3535] text-white border border-gray-500  shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Pré-Conselho
              </button>
              {abaAberta === 'pre' && <FormFiltros rotaDestino="/preconselho" />}

              <button
                onClick={() => toggleAba('final')}
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500  text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  abaAberta === 'final' ? 'bg-[#df3535] text-white border border-gray-500  shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Conselho Final
              </button>
              {abaAberta === 'final' && <FormFiltros rotaDestino="/conselhofinal" />}
            </div>
          )}

          {/* RELATÓRIOS */}
          <button
            onClick={toggleMenuRelatorio}
            className={`flex items-center justify-between w-full h-[10vh] px-4 mx-auto mt-4 bg-[var(--button_bg)] rounded-[10px] border border-black font-bold text-xl shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'relatorios' || menuRelatorioAberto ? 'bg-[#df3535] text-white' : ''
            }`}>
            <img src={reportIcon} className={`w-6 h-6 ${botaoSelecionado === 'relatorios' || menuRelatorioAberto ? 'brightness-0 invert' : 'brightness-0'}`} alt="Relatórios" />
            
            <p className="flex-1 text-center">Relatórios</p>
            
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
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500 text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/ata' ? 'bg-[#df3535] text-white border border-black shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Gerar Ata
              </button>

              <button
                onClick={() => navigate('/relatorios/relatorio')}
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500 text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/relatorio' ? 'bg-[#df3535] text-white border border-black shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Gerar Relatório
              </button>

              <button
                onClick={() => navigate('/relatorios/termo')}
                className={`w-full py-3 px-4 rounded-[8px] border border-gray-500 text-[0.95rem] font-medium transition-all text-center whitespace-nowrap ${
                  location.pathname === '/relatorios/termo' ? 'bg-[#df3535] text-white border border-black shadow-md' : 'bg-[#d9d9d9] border-[#ccc] hover:bg-gray-300'
                }`}>
                Gerar Termo de Ciência
              </button>
            </div>
          )}

        </div>


        <div className="w-full flex justify-center border-t border-[#ccc]">
          <button
            onClick={() => handleClick('/configuracoes', 'configuracoes')}
            className={`flex items-center justify-center w-full h-[60px] px-[20px] bg-[var(--button_bg)] border shadow-[0px_-1px_5px_rgb(150,150,150)] font-bold text-xl cursor-pointer transition-all gap-[15px] ${
              botaoSelecionado === 'configuracoes' ? 'bg-[#df3535] text-white border border-[#df3535]' : '' 
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
