import TopBar from "../TopBar";
import NavBar from "../NavBar";
import { useEffect } from "react";
import './index.scss';
import SearchBar from "../../reusable/SearchBar";
import PostDetails from "../../popups/PostDetails";
import outfit from '../../../assets/images/home/testoutfit.jpg';
import AddIcon from '@mui/icons-material/Add';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState } from "react";

const Explore = () => {
    const [like, setLike] = useState(false)
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="explore">
            <TopBar/>
                <div className="nav-content">
                    <NavBar/>
                    {showDetails && 
                        <PostDetails
                            like={like}
                            setLike={setLike}
                            setShowDetails={setShowDetails}
                    />}
                    <div className="nav-content-wrapper">
                        <SearchBar/>
                        <div className="posts">
                            <div className="post">
                                <img src={outfit}/>
                                <div className="post-save-bar">
                                    <div className="like-btn" onClick={() => setLike(prev => !prev)}>
                                        {!like && <FavoriteBorderIcon/>}
                                        {like && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                        <p>345</p>
                                    </div>
                                    <div className="save-btn">
                                        <AddIcon/>
                                        <p>SAVE</p>
                                    </div>
                                </div>
                            </div>
                            <div className="post">
                                <img src={'https://i.pinimg.com/736x/e6/20/90/e62090b96f0d3fcc30d0153fc32adbc1.jpg'}/>
                                <div className="post-save-bar">
                                    <div className="like-btn" onClick={() => setLike(prev => !prev)}>
                                        {!like && <FavoriteBorderIcon/>}
                                        {like && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                        <p>345</p>
                                    </div>
                                    <div className="save-btn">
                                        <AddIcon/>
                                        <p>SAVE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
} 

export default Explore