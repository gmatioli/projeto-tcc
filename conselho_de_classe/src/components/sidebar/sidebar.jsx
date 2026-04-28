import { useState } from 'react';
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

  // Estados de abertura dos menus
  const [menuConselhoAberto, setMenuConselhoAberto] = useState(false);
  const [menuRelatorioAberto, setMenuRelatorioAberto] = useState(false);
  
  // Estado para saber qual filtro está aberto (null, 'intermediario', 'pre', ou 'final')
  const [abaAberta, setAbaAberta] = useState(null);

  const toggleAba = (aba) => {
    setAbaAberta(abaAberta === aba ? null : aba);
  };

  const toggleMenuConselho = () => {
    const novoEstado = !menuConselhoAberto;
    setMenuConselhoAberto(novoEstado);
    
    // Se abrir conselhos, fecha relatórios
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
    
    // Se abrir relatórios, fecha conselhos
    if (novoEstado) {
      setBotaoSelecionado('relatorios');
      setMenuConselhoAberto(false);
      setAbaAberta(null);
    } else {
      setBotaoSelecionado(null);
    }
  };

  // Função para botões simples (Dashboard, Configurações)
  const handleClick = (rota, nomeBotao) => {
    navigate(rota);
    setBotaoSelecionado(botaoSelecionado === nomeBotao ? null : nomeBotao);
    setMenuConselhoAberto(false);
    setMenuRelatorioAberto(false);
  };

  // Componente do Formulário 
  const FormFiltros = ({ rotaDestino }) => (
    <div className="flex flex-col gap-[12px] border-l-[2px] border-[#df3535] pl-[15px] ml-[5px] mb-[10px]">
      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-[0.9rem] font-medium text-[#333]">Tipo de Curso:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]">
          <option>Técnico</option>
          <option>CAI</option>
        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-[0.9rem] font-medium text-[#333]">Curso:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]">
          <option>Desenvolvimento de Sistemas</option>
        </select>
      </div>

      <div className="flex flex-col text-left gap-[5px]">
        <label className="text-[0.9rem] font-medium text-[#333]">Turma:</label>
        <select className="p-[8px] rounded-[5px] border border-[#ccc] bg-white text-[0.9rem] outline-none focus:border-[#df3535]">
          <option>CPTMTDS4T126</option>
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

  // Verificação de relatório ativo pela URL
  const isRelatorioAtivo = ['/relatorios/ata', '/relatorios/relatorio', '/relatorios/termo'].includes(location.pathname);

  return (
    <section className="h-screen">
      <div className="bg-[var(--sidebar_bg)] w-[18vw] h-full flex flex-col border-r border-[#ccc] overflow-hidden">

        <div className="flex-1 overflow-y-auto mt-[30px] px-4 pb-24 custom-scrollbar">

          {/* DASHBOARD */}
          <button
            onClick={() => handleClick('/dashboard', 'dashboard')}
            className={`flex items-center justify-between w-[14vw] h-[10vh] px-[20px] mx-auto mt-[25px] bg-[var(--button_bg)] rounded-[10px] font-bold text-[1.25rem] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'dashboard' 
                ? 'bg-[#df3535] text-white' 
                : ''
            }`}>
            <img 
              src={dashboardIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Dashboard" 
            />
            <p>Dashboard</p>
            <img 
              src={arrowRightIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'dashboard' ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Seta" 
            />
          </button>

          {/* CONSELHOS */}
          <button
            onClick={toggleMenuConselho}
            className={`flex items-center justify-between w-[14vw] h-[10vh] px-[20px] mx-auto mt-[25px] bg-[var(--button_bg)] rounded-[10px] font-bold text-[1.25rem] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'conselhos' || menuConselhoAberto 
                ? 'bg-[#df3535] text-white' 
                : ''
            }`}>
            <img 
              src={councilIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Conselhos" 
            />
            <p>Conselhos</p>
            <img
              src={arrowRightIcon}
              className={`w-6 h-6 ${botaoSelecionado === 'conselhos' || menuConselhoAberto ? 'brightness-0 invert' : 'brightness-0'} transition-transform duration-300 ${menuConselhoAberto ? 'rotate-90' : ''}`}
              alt="Seta"
            />
          </button>

          {/* SUBMENU CONSELHOS */}
          {menuConselhoAberto && (
            <div className="flex flex-col w-[14vw] mx-auto mt-[10px] gap-[10px]">
              <button
                onClick={() => toggleAba('intermediario')}
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  abaAberta === 'intermediario'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}>
                Conselho Intermediário
              </button>
              {abaAberta === 'intermediario' && <FormFiltros rotaDestino="/conselhointermediario" />}

              <button
                onClick={() => toggleAba('pre')}
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  abaAberta === 'pre'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}>
                Pré-Conselho
              </button>
              {abaAberta === 'pre' && <FormFiltros rotaDestino="/preconselho" />}

              <button
                onClick={() => toggleAba('final')}
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  abaAberta === 'final'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}>
                Conselho Final
              </button>
              {abaAberta === 'final' && <FormFiltros rotaDestino="/conselhofinal" />}
            </div>
          )}

          {/* RELATÓRIOS (Agora com a fusão do menu dropdown + Tailwind!) */}
          <button
            onClick={toggleMenuRelatorio}
            className={`flex items-center justify-between w-[14vw] h-[10vh] px-[20px] mx-auto mt-[25px] bg-[var(--button_bg)] rounded-[10px] font-bold text-[1.25rem] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'relatorios' || menuRelatorioAberto || isRelatorioAtivo
                ? 'bg-[#df3535] text-white' 
                : ''
            }`}>
            <img 
              src={reportIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'relatorios' || menuRelatorioAberto || isRelatorioAtivo ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Relatórios" 
            />
            <p>Relatórios</p>
            <img 
              src={arrowRightIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'relatorios' || menuRelatorioAberto || isRelatorioAtivo ? 'brightness-0 invert' : 'brightness-0'} transition-transform duration-300 ${menuRelatorioAberto ? 'rotate-90' : ''}`} 
              alt="Seta" 
            />
          </button>

          {/* SUBMENU RELATÓRIOS */}
          {menuRelatorioAberto && (
            <div className="flex flex-col w-[14vw] mx-auto mt-[10px] gap-[10px]">
              <button
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  location.pathname === '/relatorios/ata'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}
                onClick={() => navigate('/relatorios/ata')}
              >
                Gerar Ata
              </button>

              <button
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  location.pathname === '/relatorios/relatorio'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}
                onClick={() => navigate('/relatorios/relatorio')}
              >
                Gerar Relatório
              </button>

              <button
                className={`p-[15px] rounded-[8px] border text-[1rem] font-medium transition-all ${
                  location.pathname === '/relatorios/termo'
                    ? 'bg-[#df3535] text-white border-[#df3535] shadow-md'
                    : 'bg-[#d9d9d9] border-[#ccc]'
                }`}
                onClick={() => navigate('/relatorios/termo')}
              >
                Gerar Termo de Ciência
              </button>
            </div>
          )}

        </div>
        
        {/* CONFIGURAÇÕES */}
        <div className="flex flex-row w-full border-t border-[#ccc]">
          <button
            onClick={() => handleClick('/configuracoes', 'configuracoes')}
            className={`w-full h-[60px] flex flex-row items-center justify-center rounded-none gap-2.5 text-xl cursor-pointer hover:bg-gray-200 transition-colors ${
              botaoSelecionado === 'configuracoes' 
                ? 'bg-[#df3535] text-white hover:bg-[#df3535]' 
                : ''
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