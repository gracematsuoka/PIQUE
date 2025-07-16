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
import { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
    useEffect(() => {
        AOS.init({duration: 1500});
    })

    return (
        <div className="home"> 
            <HomeNavBar />
            <hr></hr>
            <div className="home-container">
                <div className="left-home">
                    <p className="bg-text">PIQ<br/>.UE</p>
                    <div className="front-text">
                        <div className="main-text">
                            <p data-aos='fade-right'>Your personal stylist </p>  
                            <p data-aos='fade-right' data-aos-delay='200'>look book, and </p>
                            <p data-aos='fade-right' data-aos-delay='400'>digital wardrobe </p>
                            <p data-aos='fade-right' data-aos-delay='600'><i>⎯ all in one.</i></p>
                        </div>
                        <div className="sub-text"  data-aos="fade-in" data-aos-duration="4000" data-aos-delay='2000'>
                            <Link to='/sign-up' id='sign-up'>
                                <p>GET STARTED</p>
                                <EastIcon/>
                            </Link>

                        </div>
                    </div>
                </div>
                <div className="right-home">
                    <div className="sample-fit" data-aos="zoom-in" data-aos-duration="4000" data-aos-delay="200">
                        <img id="knit" src={WhiteKnit}/>
                        <img id="sweats" src={Sweats}/>
                    </div>
                    <div className="sample-fit" data-aos="zoom-in" data-aos-duration="4000">
                        <img id="blouse" src={Blouse}/>
                        <img id="jeans" src={Jeans}/>
                    </div>
                    <div className="sample-fit" data-aos="zoom-in" data-aos-duration="4000" data-aos-delay="200">
                        <img id="tank" src={Tank}/>
                        <img id="skirt" src={Skirt}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;