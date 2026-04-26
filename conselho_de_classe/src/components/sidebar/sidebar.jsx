import { useState } from 'react';
import './sidebar-style.css';
import dashboardIcon from '../../assets/sidebar/dashboard-icon.svg';
import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';
import { useNavigate } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();

  // Estado para controlar se o submenu "Conselhos" inteiro está visível
  const [menuConselhoAberto, setMenuConselhoAberto] = useState(false);
  
  // Estado para saber qual filtro está aberto (null, 'intermediario', 'pre', ou 'final')
  const [abaAberta, setAbaAberta] = useState(null);

  const toggleAba = (aba) => {
    setAbaAberta(abaAberta === aba ? null : aba);
  };

  const toggleMenuConselho = () => {
    setMenuConselhoAberto(!menuConselhoAberto);
    // Opcional: fecha as abas internas caso feche o menu principal
    if (menuConselhoAberto) {
      setAbaAberta(null); 
    }
  };

  // Componente do Formulário 
  const FormFiltros = ({ rotaDestino }) => (
    <div className="form_filtros">
      <div className="grupo_input">
        <label>Tipo de Curso:</label>
        <select>
          <option>Técnico</option>
          <option>CAD</option>
        </select>
      </div>

      <div className="grupo_input">
        <label>Curso:</label>
        <select>
          <option>Desenvolvimento de Sistemas</option>
        </select>
      </div>

      <div className="grupo_input">
        <label>Turma:</label>
        <select>
          <option>CPTMTDS4T126</option>
        </select>
      </div>

      <div className="botoes_filtro">
        <button className="btn_limpar">Limpar Filtro ⟲</button>
        <button className="btn_pesquisar" onClick={()=> navigate(rotaDestino)}>Pesquisar 🔍</button>
      </div>
    </div>
  );

  
  return (
    <section>
      <div className="background_sidebar">
        <div className='div_buttons'>
          
          <button className="btn_dashboard" onClick={() => navigate('/dashboard')}>
            <img src={dashboardIcon} alt="Ícone Dashboard" />
            <p>Dashboard</p>
            <img src={arrowRightIcon} alt="Seta direita" />
          </button>
          
          {/* BOTÃO PRINCIPAL COM ONCLICK */}
          <button className="btn_conselho" onClick={toggleMenuConselho}>
            <img src={councilIcon} alt="Ícone Conselhos" />
            <p>Conselhos</p>
            <img 
              src={arrowRightIcon} 
              alt="Seta direita" 
              className={menuConselhoAberto ? 'seta_aberta' : ''} 
            />
          </button>

          {/* SÓ RENDERIZA SE menuConselhoAberto FOR TRUE */}
          {menuConselhoAberto && (
            <div className="submenu_conselho">
              {/* BOTÃO 1 */}
              <button 
                className={`btn_conselho_intermediario ${abaAberta === 'intermediario' ? 'ativo' : ''}`}
                onClick={() => toggleAba('intermediario')}
              >
                Conselho Intermediário
              </button>
              {abaAberta === 'intermediario' && <FormFiltros rotaDestino="/conselhointermediario"/>}

              {/* BOTÃO 2 */}
              <button 
                className={`pre_conselho ${abaAberta === 'pre' ? 'ativo' : ''}`}
                onClick={() => toggleAba('pre')}
              >
                Pré-Conselho
              </button>
              {abaAberta === 'pre' && <FormFiltros rotaDestino="/preconselho" />}

              {/* BOTÃO 3 */}
              <button 
                className={`conselho_final ${abaAberta === 'final' ? 'ativo' : ''}`}
                onClick={() => toggleAba('final')}
              >
                Conselho Final
              </button>
              {abaAberta === 'final' && <FormFiltros rotaDestino="/conselhofinal" />}
            </div>
          )}

          <button className="btn_relatorio">
            <img src={reportIcon} alt="Ícone Relatórios" />
            <p>Relatórios</p>
            <img src={arrowRightIcon} alt="Seta direita" />

          </button>

        </div>
        
        <div className="div_config">
          <button className="btn_config" style={{ cursor: 'pointer' }} onClick={() => navigate('/configuracoes')}>
            <img src={configIcon} alt="Ícone Configurações" />
            <p>Configurações</p>
          </button>
        </div>
      </div>
    </section>
  );
}