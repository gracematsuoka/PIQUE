import { useEffect, useRef, useState } from 'react';
import './index.scss';
import {ReactComponent as More} from '../../../assets/images/icons/more.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import addClothes from "../../../assets/images/icons/addclothes.png";
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';
import { useCloset } from '../../../contexts/ClosetContext';
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg';
import {getAuth} from 'firebase/auth';

const Items = ({onSelectItem, reload, updatedItem, addedItem, setSelectedItem}) => {
    const { closetItems, setClosetItems, loading, setLoading } = useCloset();
    const [selectedId, setSelectedId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (!updatedItem || !updatedItem._id) return;

        setClosetItems(prev => 
                prev.map(item => 
                    item._id === updatedItem._id ? updatedItem : item
        ))
        setSelectedItem(null);
    }, [updatedItem]) 

    useEffect(() => {
        if (!addedItem || !addedItem._id) return;

        setClosetItems(prev => [...prev, addedItem])
    }, [addedItem])

    const handleDelete = async () => {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        console.log('front:', deleteId)
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-items/delete-item?itemId=${deleteId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setDeleteId(null);
        setSelectedId(null);
    }

    return (
        <div className='items'>
            {loading ? (
                <Bouncy
                    size="45"
                    speed="1.75"
                    color="#6B799F"
                    />
            ) : closetItems.length > 0 ? (
                closetItems.map(item => 
                    <div className='item-wrapper' key={item._id}>
                        <img loading='lazy' 
                            src={item.itemRef?.imageURL.replace('/public', '/300')}
                            alt={item.name}
                            />
                        <div className='item-label'>
                            <circle style={{backgroundColor: item.colors[0].hex}}/>
                            <p>{item.name}</p>
                        </div>
                        <div className='more' onClick={e => setSelectedId(prev => prev === item._id ? null : item._id)}>
                            <More />
                            {(selectedId === item._id) && 
                            <div className='mini-pop'>
                                <div className='sub-btn' onClick={e => setDeleteId(prev => prev === item._id ? null : item._id)}>
                                    <DeleteIcon/>
                                    <p>Delete</p>
                                </div>
                                <div className='sub-btn' onClick={() => onSelectItem(item)}>
                                    <EditRoundedIcon/>
                                    <p>Edit</p>
                                </div>
                            </div>
                            }
                        </div>
                        {deleteId && 
                            <>
                                <div className="popup-overlay"></div>
                                <div className="popup-container overlay">
                                    <div className='x' onClick={() => setDeleteId(null)}>
                                        <CloseIcon/>
                                    </div>
                                    <div className='popup-content'>
                                        <p className='popup-name'>🚨 Warning</p>
                                        <p>Deleting an item cannot be undone</p>
                                        <button className='sub-btn' onClick={handleDelete}>Delete Item</button>
                                        <button className='sub-btn cancel' onClick={() => setDeleteId(null)}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                )
            ) : (
                <div className='empty'>
                    <p>You have no items in your closet yet...</p>
                    <div className='empty-h1'>
                        <h1>Click </h1>
                        <div className='add-icon'>
                            <img src={addClothes}/>
                        </div>
                        <h1> to get started</h1>
                    </div>
                    <h1>↪</h1>
                </div>
            )}
        </div>
    )
}

export default Items;