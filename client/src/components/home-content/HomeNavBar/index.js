import './index.scss'
import { Link } from 'react-router-dom';

const HomeNavBar = () => {

    return (
        <div className="home-nav-bar">
            <div className="left-nav">
                {/* <p>BROWSE</p>
                <p>ABOUT</p>
                <p>PRICING</p> */}
            </div>
            <h1>PIQUE</h1>
            <div className="right-nav">
                <Link to='/log-in' id='log-in'>LOG IN</Link>
                <Link to='/sign-up' id='sign-up'>SIGN UP</Link>
            </div>
        </div>
    )
}

export default HomeNavBar;