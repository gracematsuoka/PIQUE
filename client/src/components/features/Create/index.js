import NavBar from "../NavBar";
import TopBar from "../TopBar";
import './index.scss';
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg';
import SearchBar from "../../reusable/SearchBar";
import Filter from "../../popups/Filter";

const Create = () => {
    return (
        <div className="create">
            <TopBar/>
                <div className="nav-content">
                    <NavBar/>
                    <div className="nav-content-wrapper">
                        <div className="basic-nav create">
                            <p>CREATE</p>
                            <p>DRAFTS</p>
                        </div>
                        <hr/>
                        <div className="create-wrapper">
                            <div className="create-board">
                                <div className="input-wrapper">
                                    <input type='text' placeholder="Title goes here..."/>
                                </div>
                                <div className='empty-board-message'>
                                    <ShirtIcon className='clothes-upload'/>
                                    <p>Start dragging items here</p>
                                </div>
                                <div className="button-wrapper">
                                    <button className="sub-btn post">POST</button>
                                    <button className="sub-btn">SAVE</button>
                                </div>
                            </div>
                            <div className="create-sidebar">
                                <div className="basic-nav sub">
                                    <p>CLOSET</p>
                                    <p>DATABASE</p>
                                    <p>UPLOAD</p>
                                </div>
                                <div className="search-filter">
                                    <SearchBar/>
                                    {/* <Filter /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Create