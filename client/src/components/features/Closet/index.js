import "./index.scss"
import { useAuth } from "../../../contexts/AuthContext"
import addClothes from "../../../assets/images/icons/addclothes.png"
import SearchBar from "../../reusable/SearchBar"
import AddItem from "../../popups/AddItem"
import ItemDetails from "../../popups/ItemDetails"
import Filter from "../../popups/Filter"
import Items from "../Items"
import { useState, useEffect } from "react"
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg'
import Tooltip from "@mui/material/Tooltip";
import { useTag } from "../../hooks/useTag"
import ErrorIcon from '@mui/icons-material/Error';

const Closet = () => {
    const {mongoUser} = useAuth();
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [tab, setTab] = useState('closet');
    const [tags, setTags] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [colors, setColors] = useState([]);
    const [showItemDetails, setShowItemDetails] = useState(false);
    const [processedUrl, setProcessedUrl] = useState('');
    const [reloadItems, setReloadItems] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [filled, setFilled] = useState(0);
    const [updatedItem, setUpdatedItem] = useState(null);
    const [addedItem, setAddedItem] = useState(null);

    const colorOptions = {
        Red: '#F35050',
        Orange: '#EEA34E',
        Yellow: '#F5D928',
        Green: '#91D58C',
        Blue: '#81AAEA',
        Purple: '#BE9FE5',
        Pink: '#F1AFD6',
        Black: '#000000',
        White: '#FFFFFF',
        Grey: '#868585',
        Beige: '#E9E0B6',
        Brown: '#A26D2C',
    } 

    const {data: dbTags=[]} = useTag();

    useEffect(() => {
        const populateTags = async () => {
            setTags(dbTags.map(tag => ({
                name: tag.name,
                hex: tag.hex,
                key: tag._id,
                checked: false
            })));
        }

        populateTags();
        const colorMap = Object.keys(colorOptions)
            .map(color => ({
                    color,
                    hex: colorOptions[color],
                    checked: false
                })
        );
        setColors(colorMap)
    }, []) 

    useEffect(() => {
        if(loading && filled < 100) {
            setTimeout(() => setFilled(prev => prev += 10), 50)
        }
    }, [filled, loading])

    const handleError = () => {
        setError(true);

        setTimeout(() => {
            setError(false)
        }, 30000);
    }

    const toggleAddPopup = () => {
        setShowAddPopup(!showAddPopup);
    }

    const handleCloseDetails = () => {
        setSelectedItemId(null);
    }

    return (
        <div className="closet">
        {showAddPopup && <AddItem onClose={toggleAddPopup}
                                setShowAddPopup={setShowAddPopup}
                                setShowItemDetails={setShowItemDetails}
                                processedUrl={processedUrl}
                                setProcessedUrl={setProcessedUrl}
                                tab={tab}
                                setReloadItems={setReloadItems}
                                />}
            <div className="nav-content-wrapper">
                <p className="welcome-header">Welcome to your closet, {mongoUser?.name || 'Name'}</p>
                <div className="basic-nav">
                    <p className={tab === 'closet' ? 'active' : ''}>MY CLOSET</p>
                    <p className={tab === 'wishlist' ? 'active' : ''}>MY WISHLIST</p>
                    {/* <p className={tab === 'collections' ? 'active' : ''}>COLLECTIONS</p> */}
                </div>
                <SearchBar/>
                <Tooltip title='New item'>
                <div className="add" onClick={toggleAddPopup}>
                    <img src={addClothes}/>
                </div>
                </Tooltip>
                <div className="nav-filter-wrapper">
                    <div className="basic-nav sub">
                        <p>ALL</p>
                        <p>TOPS</p>
                        <p>BOTTOMS</p>
                        <p>OUTERWEAR</p>
                        <p>SHOES</p>
                        <p>JEWELRY</p>
                        <p>BAGS</p>
                        <p>ACCESSORIES</p>
                    </div>
                    <div className="filter" onClick={e => setShowFilter(!showFilter)}>
                        <p>Filter</p>
                        <FilterIcon/>
                    </div>
                </div>
                <div className="items-wrapper">
                    <Items 
                        tab={tab}
                        onSelectItem={(item) => {
                            setSelectedItemId(item._id);
                            setShowItemDetails(true);
                        }}
                        />
                </div>
                {loading && 
                    <div className="toast">
                        <div className="progress-bar" 
                            style={{width: `${filled}%`}}
                            />
                        <p>Saving item ...</p>
                    </div>
                }
                {error && 
                    <div className="toast error">
                        <ErrorIcon/>
                        <p>Error saving item</p>
                    </div>
                }
                <Filter className={`popup-container filter ${showFilter ? 'open' : ''}`} 
                        setShowFilter={setShowFilter}
                        tags={tags}
                        setTags={setTags}
                        colors={colors}
                        setColors={setColors}
                />
                {showItemDetails && <ItemDetails 
                                        mode='create' 
                                        setShowItemDetails={setShowItemDetails}
                                        processedUrl={processedUrl}
                                        tab={tab}
                                        setReloadItems={setReloadItems}
                                        setLoading={setLoading}
                                        handleError={handleError}
                                        />}
                {showItemDetails && selectedItemId && 
                                    <ItemDetails 
                                        mode='edit' 
                                        setShowItemDetails={setShowItemDetails}
                                        tab={tab}
                                        selectedItemId={selectedItemId}
                                        setSelectedItemId={setSelectedItemId}
                                        onClose={handleCloseDetails}
                                        setLoading={setLoading}
                                        handleError={handleError}
                                        />}
            </div>
        </div>
    )
}

export default Closet