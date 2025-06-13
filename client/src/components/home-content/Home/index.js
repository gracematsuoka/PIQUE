import HomeNavBar from "../HomeNavBar";
import Tank from '../../../assets/images/home/bluetank.png'
import Sweats from '../../../assets/images/home/greysweats.png'
import Jeans from '../../../assets/images/home/jeans.png'
import RiskT from '../../../assets/images/home/norisktshirt.png'
import Skirt from '../../../assets/images/home/whiteskirt.png'
import Blouse from '../../../assets/images/home/whitetankblouse.png'
import './index.scss'
import { Link } from 'react-router-dom';

const Home = () => {

    return (
        <div className="home"> 
            <HomeNavBar />
            <hr></hr>
            <div className="home-container">
                <div className="left-home">
                    <p className="bg-text">PIQ<br/>.UE</p>
                    <div className="front-text">
                        <p className="main-text">Your personal stylist, planner & look book...<br></br>all in one.</p>
                        <div className="sub-text">
                            <Link to='/sign-up' id='sign-up'>GET STARTED --&#62;</Link>
                            
                        </div>
                    </div>
                </div>
                <div className="right-home">
                    <div className="tops">
                        <img id="riskt" src={RiskT}></img>
                        <img id="blouse" src={Blouse}></img>
                        <img id="tank" src={Tank}></img>
                    </div>
                    <div className="bottoms">
                        <img id="sweats" src={Sweats}></img>
                        <img id="jeans" src={Jeans}></img>
                        <img id="skirt" src={Skirt}></img>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;