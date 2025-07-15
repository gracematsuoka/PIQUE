import { useEffect, useRef, useState } from "react";
import { Hourglass } from 'ldrs/react'
import 'ldrs/react/Hourglass.css'
import './index.scss';
import { auth } from "../../../firebase";
import { fetchWithError } from "../../../utils/fetchWithError";
import CachedIcon from '@mui/icons-material/Cached';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from '@mui/icons-material/Close';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

const Results = ({input, selected, setShowResults}) => {
    const [loading, setLoading] = useState(false);
    const [outfitItems, setOutfitItems] = useState([]);
    const [full, setFull] = useState(null);
    const [top, setTop] = useState(null);
    const [bottom, setBottom] = useState(null);
    const [shoe, setShoe] = useState({});
    const [selectedItem, setSelectedItem] = useState('');
    const [cursorPos, setCursorPos] = useState([]);
    const fetchedRef = useRef(false);
    const [messages, setMessages] = useState(null);

    useEffect(() => {
        console.log('selected', selectedItem)
    }, [selectedItem])

    let param;
    if (selected.length == 2) {
        param = 'all==true'
    } else {
        param = `tab=${selected[0]}`
    }

    const fetchAIRes = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/chat/result?${param}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({input, prevMessages: messages})
            });
            const response = res.response;
            setMessages(res.messages) ;
            console.log('res', response)

            let count = 0;
            response.forEach(item => {
                if (item.category === 'Tops') {
                    setTop(item);
                } else if (item.category === 'Bottoms') {
                    setBottom(item);
                } else if (item.category === 'Dresses/Rompers' || item.category === 'Sets' || item.category === 'Swimewear') {
                    setFull(item);
                } else if (item.category === 'Shoes') {
                    setShoe(item);
                } else {
                    setOutfitItems(prev => [...prev, item]);
                    count += 1;
                }
            });

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchAIRes();
    }, []);

    const handleSelect = (item, e) => {
        setCursorPos([e.clientX, e.clientY]);
        setSelectedItem(item);
    }

    if (loading) return (
        <div className="loading-result">
            <Hourglass
                size="50"
                bgOpacity="0.1"
                speed="1.75"
                color='#6B799F' 
            />
            <p>Assembling your outfit...</p>
        </div>
    )

    return (
        <div className="results">
            <div className="outfit-text">
                <p>showing result for:</p>
                <h1>{input}</h1>
                <p style={{color: '#B9B9B9'}}><i>click item to view details</i></p>
                <div className="quick-add">
                    <Tooltip title='Try again'>
                    <div className="toolbar-icon" onClick={fetchAIRes}>
                        <CachedIcon/>
                    </div>
                    </Tooltip>
                    <Tooltip title='New prompt'>
                    <div className="toolbar-icon" onClick={() => setShowResults(false)}>
                        <SearchIcon/>
                    </div>
                    </Tooltip>
                </div>
            </div>
            <div className="outfit-res">
                <div className="main-fit">
                    {!full && top &&
                        <div className="res-item top" onClick={e => handleSelect(top, e)}>
                            <img src={top.itemRef?.imageURL}/>
                        </div>
                    }
                    {!full && bottom &&
                        <div className="res-item bottom" onClick={e => handleSelect(bottom, e)}>
                            <img src={bottom.itemRef?.imageURL}/>
                        </div>
                    }
                    {full &&
                        <div className="res-item full" onClick={e => handleSelect(full, e)}>
                            <img src={full.itemRef?.imageURL}/>
                        </div>
                    }
                    {/* {shoe &&
                        <div className="res-item shoe" 
                            // style={{bottom: full ? '-160px' : '-80px'}}
                            onClick={e => handleSelect(shoe, e)}>
                            <img src={shoe.itemRef?.imageURL}/>
                        </div>
                    } */}
                    
                </div>
                <div className="extra-fit">
                    {outfitItems.map(item => 
                        <div className="res-item extra" 
                            style={{width: item.category === 'Jewelry' ? '90px' : '150px', height: item.category === 'Jewelry' ? '90px' : '160px'}}
                            onClick={e => handleSelect(item, e)}
                            key={item._id}>
                            <img src={item.itemRef?.imageURL}/>
                        </div>
                    )}
                    {shoe &&
                        <div className="res-item shoe" 
                            // style={{bottom: full ? '-160px' : '-80px'}}
                            onClick={e => handleSelect(shoe, e)}>
                            <img src={shoe.itemRef?.imageURL}/>
                        </div>
                    }
                </div>
                    {selectedItem &&
                        <div className='post-item-det' style={{left: `${cursorPos[0]}px`, top: `${cursorPos[1]}px`}}>
                            <div className='close' onClick={() => setSelectedItem(null)}>
                                <CloseIcon/>
                            </div>
                            <div className='item-header'>
                                <h1>{selectedItem?.name}</h1>
                                <p id='brand' style={{color: selectedItem?.brand ? 'black' : '#BBBBBB'}}>
                                    {selectedItem?.brand || '---'}
                                </p>
                                <div className='item-link'>
                                    <a href={selectedItem?.link.startsWith('http') ? selectedItem?.link : `https://${selectedItem?.link}`}
                                        id='link'
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            if (!selectedItem?.link) e.preventDefault(); 
                                        }}
                                        style={{color: selectedItem?.link ? 'white' : '#BBBBBB'}}>
                                        {selectedItem?.link.replace('https://', '').replace('www.', '') || '---'}
                                    </a>
                                    <ArrowOutwardIcon/>
                                </div>
                            </div>
                            <hr/>
                            <div className='item-mid'>
                                <div className='item-field-disp'>
                                    <label htmlFor='price'>PRICE</label>
                                    <p id='price' style={{color: selectedItem?.price ? 'black' : '#BBBBBB'}}>
                                        ${selectedItem?.price || ' ---'}
                                    </p>
                                </div>
                                <div className='item-field-disp'>
                                    <label htmlFor='category'>CATEGORY</label>
                                    <p id='category' style={{color: selectedItem?.category ? 'black' : '#BBBBBB'}}>
                                        {selectedItem?.category || '---'}
                                    </p>
                                </div>
                            </div>
                            <hr/>
                            <div className="item-tags">
                                <div className="tag-title">
                                    <p>TAGS</p>
                                </div>
                                <div className="tags-wrapper">
                                {selectedItem.tags.map(tag => 
                                    <div className="tag" style={{backgroundColor: tag.hex}}>
                                        <p>{tag.name}</p>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                    }
                <div className="spacer"/>
            </div>
        </div>
    )
}

export default Results;

