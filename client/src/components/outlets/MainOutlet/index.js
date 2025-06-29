import './index.scss';
import { Outlet } from 'react-router-dom';
import TopBar from '../../features/TopBar';
import NavBar from '../../features/NavBar';

const MainOutlet = () => {
    return (
        <div className='main-outlet'>
            <TopBar/>
            <div className="nav-content">
                <NavBar/>
            </div>
            <Outlet/>
        </div>
    )
}

export default MainOutlet;