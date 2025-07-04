import './index.scss';
import { Outlet, NavLink, useLocation } from "react-router-dom";

const CreateOutlet = () => {
    const location = useLocation();
    return (
        <div className="create-outlet">
                <div className="nav-content-wrapper basic" >
                    <div className="basic-nav">
                        <NavLink to='/create' 
                                className={
                                    (location.pathname === '/create') ? 'active' : ''
                                }>
                            CREATE
                        </NavLink>
                        {/* <NavLink to='/create/drafts' className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
                            DRAFTS
                        </NavLink> */}
                    </div>
                    <Outlet/>
                </div>
        </div>
    )
}

export default CreateOutlet