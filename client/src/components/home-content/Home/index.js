import HomeNavBar from "../HomeNavBar";
import Tank from '../../../assets/images/home/bluetank.png'
import Sweats from '../../../assets/images/home/greysweats.png'
import Jeans from '../../../assets/images/home/jeans.png'
import WhiteKnit from '../../../assets/images/home/whiteknit.png'
import Skirt from '../../../assets/images/home/whiteskirt.png'
import Blouse from '../../../assets/images/home/whitetankblouse.png'
import './index.scss'
import { Link } from 'react-router-dom';
import EastIcon from '@mui/icons-material/East';

const Home = () => {

    return (
        <div className="home"> 
            <HomeNavBar />
            <hr></hr>
            <div className="home-container">
                <div className="left-home">
                    <p className="bg-text">PIQ<br/>.UE</p>
                    <div className="front-text">
                        <p className="main-text">Made for style,<br/> powered by <br/>community.</p>
                        <div className="sub-text">
                            <Link to='/sign-up' id='sign-up'>
                                <p>GET STARTED</p>
                                <EastIcon/>
                            </Link>

                        </div>
                    </div>
                </div>
                <div className="right-home">
                    <div className="sample-fit">
                        <img id="knit" src={WhiteKnit}/>
                        <img id="sweats" src={Sweats}/>
                    </div>
                    <div className="sample-fit">
                        <img id="blouse" src={Blouse}/>
                        <img id="jeans" src={Jeans}/>
                    </div>
                    <div className="sample-fit">
                        <img id="tank" src={Tank}/>
                        <img id="skirt" src={Skirt}/>
                    </div>
                    {/* <div className="tops">
                        <img id="knit" src={WhiteKnit}></img>
                        <img id="blouse" src={Blouse}></img>
                        <img id="tank" src={Tank}></img>
                    </div>
                    <div className="bottoms">
                        <img id="sweats" src={Sweats}></img>
                        <img id="jeans" src={Jeans}></img>
                        <img id="skirt" src={Skirt}></img>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Home;