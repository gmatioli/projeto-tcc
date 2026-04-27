import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import dashboardIcon from '../../assets/sidebar/dashboard-icon.svg';
import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';

export function Sidebar() {
  const navigate = useNavigate();

  // Estado para controlar qual botão principal está selecionado
  const [botaoSelecionado, setBotaoSelecionado] = useState(null);

  const [menuConselhoAberto, setMenuConselhoAberto] = useState(false);
  const [abaAberta, setAbaAberta] = useState(null);

  const toggleAba = (aba) => {
    setAbaAberta(abaAberta === aba ? null : aba);
  };

  const toggleMenuConselho = () => {
    const novoEstado = !menuConselhoAberto;
    setMenuConselhoAberto(novoEstado);
    
    // Comportamento toggle igual ao submenu
    if (novoEstado) {
      setBotaoSelecionado('conselhos');
    } else {
      setBotaoSelecionado(null);
    }
    
    if (!novoEstado) setAbaAberta(null);
  };

  // Função para os outros botões (Dashboard, Relatórios, Configurações)
  const handleClick = (rota, nomeBotao) => {
    navigate(rota);
    
    // Toggle: se já está selecionado, desmarca. Senão, seleciona.
    setBotaoSelecionado(botaoSelecionado === nomeBotao ? null : nomeBotao);
  };

  // Formulário de Filtros 
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

          {/* SUBMENU */}
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

          {/* RELATÓRIO */}
          <button
            onClick={() => handleClick('/relatorios', 'relatorios')}
            className={`flex items-center justify-between w-[14vw] h-[10vh] px-[20px] mx-auto mt-[25px] bg-[var(--button_bg)] rounded-[10px] font-bold text-[1.25rem] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'relatorios' 
                ? 'bg-[#df3535] text-white' 
                : ''
            }`}>
            <img 
              src={reportIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'relatorios' ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Relatórios" 
            />
            <p>Relatórios</p>
            <img 
              src={arrowRightIcon} 
              className={`w-6 h-6 ${botaoSelecionado === 'relatorios' ? 'brightness-0 invert' : 'brightness-0'}`} 
              alt="Seta" 
            />
          </button>

          {/* CONFIGURAÇÕES */}
          <button
            onClick={() => handleClick('/configuracoes', 'configuracoes')}
            className={`flex items-center justify-center w-[14vw] h-[60px] px-[20px] mx-auto mt-[25px] bg-[var(--button_bg)] rounded-[10px] font-bold text-[1.25rem] shadow-[0px_3px_3px_rgb(117,117,117)] cursor-pointer transition-all ${
              botaoSelecionado === 'configuracoes' 
                ? 'bg-[#df3535] text-white' 
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