import './sidebar-style.css'
import dashboardIcon from '../../assets/dashboard-icon.svg';
import councilIcon from '../../assets/council-icon.svg';
import reportIcon from '../../assets/report-icon.svg';
import configIcon from '../../assets/config-icon.svg';

import arrowRightIcon from '../../assets/right-arrow-icon.svg';

export function Sidebar() {

  return (
      <section>
        <div className="background_sidebar">
            <div className='div_buttons'>
                <button className="dashboard_button">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
                <button className="coucil_btn">
                    <img src={councilIcon} alt="" />
                    <p>Conselhos</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
                <button className="report_btn">
                    <img src={reportIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
            </div>
            <div className="div_config">
                <button className="config_btn">
                    <img src={configIcon} alt="" />
                    <p>Configurações</p>
                </button>
            </div>
        </div>
      </section>
      
  )
}