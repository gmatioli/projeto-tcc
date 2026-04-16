import './sidebar-style.css'
import dashboardIcon from '../../assets/sidebar/dashboard-icon.svg';
import councilIcon from '../../assets/sidebar/council-icon.svg';
import reportIcon from '../../assets/sidebar/report-icon.svg';
import configIcon from '../../assets/sidebar/config-icon.svg';
import arrowRightIcon from '../../assets/sidebar/right-arrow-icon.svg';
import { useNavigate } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  return (
      <section>
        <div className="background_sidebar">
            <div className='div_buttons'>
                <button className="btn_dashboard">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
                <button className="btn_conselho">
                    <img src={councilIcon} alt="" />
                    <p>Conselhos</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
                <button className="btn_relatorio">
                    <img src={reportIcon} alt="" />
                    <p>Relatórios</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
            </div>
            <div className="div_config">
                <button className="btn_config" style={{ cursor: 'pointer' }}  onClick={() => navigate('/configuracoes')}>
                    <img src={configIcon} alt="" />
                    <p>Configurações</p>
                </button>
            </div>
        </div>
      </section>
      
  )
}