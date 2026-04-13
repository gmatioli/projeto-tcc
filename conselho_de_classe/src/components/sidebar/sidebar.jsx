import './sidebar-style.css'
import dashboardIcon from '../../assets/dashboard-icon.svg';
import arrowRightIcon from '../../assets/right-arrow-icon.svg'

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
                <button className="dashboard_button">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
                <button className="dashboard_button">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button><button className="dashboard_button">
                    <img src={dashboardIcon} alt="" />
                    <p>Dashboard</p>
                    <img src={arrowRightIcon} alt="" />
                </button>
            </div>
        </div>
      </section>
      
  )
}