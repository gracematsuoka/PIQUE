import NavBar from "../NavBar";
import TopBar from "../TopBar";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchBar from "../../reusable/SearchBar";
import './index.scss';
import { Outlet, NavLink, useLocation } from "react-router-dom";

const Saved = () => {
    const location = useLocation();
    return (
        <div className="saved">
                <div className="nav-content-wrapper">
                    <div className="basic-nav">
                        <NavLink to='/saved/boards' 
                                className={
                                    (location.pathname === '/saved' || location.pathname === '/saved/boards') ? 'active' : ''
                                }>
                            BOARDS
                        </NavLink>
                        <NavLink to='/saved/favorites' className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
                            <FavoriteBorderIcon/>
                            <hr/>
                        </NavLink>
                        <NavLink to='/saved/all'>ALL SAVED</NavLink>
                    </div>
                    <SearchBar/>
                </div>
            <Outlet/>
        </div>
    )
}

export default Saved