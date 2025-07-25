import "./index.scss"
import BlackShirt from '../../../assets/images/icons/hangshirt-black.png'
import WhiteShirt from '../../../assets/images/icons/hangshirt-white.png'
import BlackSparkle from '../../../assets/images/icons/sparkle-black.png'
import WhiteSparkle from '../../../assets/images/icons/sparkle-white.png'
import {ReactComponent as HeartTagIcon} from '../../../assets/images/icons/hearttag.svg'
import {ReactComponent as ExploreIcon} from '../../../assets/images/icons/explore.svg'
import {ReactComponent as CreateIcon} from '../../../assets/images/icons/edit.svg'
import { Link, useLocation } from "react-router-dom"

const NavBar = () => {
    const location = useLocation();

    return (
        <div className="navbar">
            <div className={`icon-wrapper ${location.pathname === '/explore' ? 'active' : ''}`}>
                <Link to='/explore'>
                    <ExploreIcon/>
                    <p>Explore</p>
                </Link>
            </div>
            <div className={`icon-wrapper ${location.pathname.includes('/saved') ? 'active' : ''}`}>
                <Link to='/saved'>
                    <HeartTagIcon/>
                    <p>Saved</p>
                </Link>
            </div>
            <div className={`icon-wrapper ${location.pathname === '/create' ? 'active' : ''}`}>
                <Link to='/create'>
                    <CreateIcon/>
                    <p>Create</p>
                </Link>
            </div>
            <div className={`icon-wrapper shirt ${location.pathname .includes('/closet') ? 'active' : ''}`}>
                <Link to='/closet'>
                    <img src={location.pathname.includes('/closet') ? WhiteShirt : BlackShirt}/>
                    <p>Closet</p>
                </Link>
            </div>
            <div className={`icon-wrapper sparkle ${location.pathname === '/style' ? 'active' : ''}`}>
                <Link to='/style'>
                    <img src={location.pathname === '/style' ? WhiteSparkle : BlackSparkle}/>
                    <p>Style</p>
                </Link>
            </div>
        </div>
    )
}

export default NavBar