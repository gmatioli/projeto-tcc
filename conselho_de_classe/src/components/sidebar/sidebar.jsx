import './sidebar-style.css'
import { useState } from 'react';
import dashboardIcon from '../../assets/dashboard-icon.svg';
import councilIcon from '../../assets/council-icon.svg';
import reportIcon from '../../assets/report-icon.svg';
import configIcon from '../../assets/config-icon.svg';

import arrowRightIcon from '../../assets/right-arrow-icon.svg';

export function Sidebar() {
   //dx como fechado button conselho
    const [open, setOpen] = useState(false);
    //dx fechado btn conselho final
    const [openFinal, setOpenFinal] = useState(false);



  return (
      <section>
        <div className="background_sidebar">
            <div className='div_buttons'>

                {/* btn dashboard */}
                <button className="dashboard_button">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
              
                {/* btn conselho */}
                <button className={`coucil_btn ${open ? 'active' : ''}`}  onClick={() => setOpen(!open)}>
                    <img src={councilIcon} alt="" />
                    <p>Conselhos</p>
                    <img src={arrowRightIcon} alt="" className={open ? 'rotate' : ''}/>
                </button>

                {/* abrir drop  */}
                 {open && (
                        <div className="dropdown">
                        <button className="sub_button">Conselho Intermediário</button>
                        <button className="sub_button">Pré Conselho</button>
                        <button className={`sub_button ${openFinal ? 'active' : ''}`} onClick={() => setOpenFinal(!openFinal)}>Conselho Final</button>
                    </div>
                )}

                {/* drop do conselho final */}
                {openFinal && (
                <div className="dropdown_inner">
                    <div className="filtro">
                    <label>Área:</label>
                    <select>
                        <option>Técnico</option>
                        <option>CAI</option>
                    </select>

                    <label>Curso:</label>
                    <select>
                        <option>Desenvolvimento de Sistemas</option>
                        <option>Mecatrônica</option>
                        <option>Ferroviário</option>
                    </select>

                  
                    <div className="actions">
                        <button className="btn_clear">Limpar Filtro</button>
                        <button className="btn_search">Pesquisar</button>
                    </div>
                    </div>
                </div>
                )}


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