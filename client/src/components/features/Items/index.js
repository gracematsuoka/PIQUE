import { useEffect, useRef, useState } from 'react';
import './index.scss';
import {ReactComponent as More} from '../../../assets/images/icons/more.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import addClothes from "../../../assets/images/icons/addclothes.png";
import { Bouncy } from 'ldrs/react';
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg';
import { useItems } from '../../hooks/useItems';
import { useDeleteItem } from '../../hooks/useMutateItems';

const Items = ({onSelectItem, tab, handleError}) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useItems(tab)

    const deleteItem = useDeleteItem();
    const items = data?.pages.flatMap(page => page.items) || [];
    const [selectedId, setSelectedId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const sentinelRef = useRef(null);

    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
        )
        if (sentinelRef.current){
            observer.observe(sentinelRef.current)
        };

        return () => observer.disconnect();
    }, [hasNextPage]);

    return (
        <div className='items'>
            {(isLoading || isFetchingNextPage) ? (
                <Bouncy
                    size="45"
                    speed="1.75"
                    color="#6B799F"
                    />
            ) : items.length > 0 ? (
                items.map(item => 
                    <div className='item-wrapper' key={item._id}>
                        <img loading='lazy' 
                            src={item.itemRef?.imageURL}
                            alt={item.name}
                            />
                        <div className='item-label'>
                            {/* <circle style={{backgroundColor: item.colors[0].hex}}/> */}
                            <p>{item.name}</p>
                        </div>
                        <div className='more' onClick={e => setSelectedId(prev => prev === item._id ? null : item._id)}>
                            <More />
                            {(selectedId === item._id) && 
                            <div className='mini-pop'>
                                <div className='sub-btn' onClick={e => setDeleteId(item._id)}>
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
                                        <button className='sub-btn' 
                                                onClick={() => 
                                                    deleteItem.mutate(
                                                        {itemId: deleteId, tab},
                                                        {
                                                            onError: (err) => handleError(err),
                                                            onSettled: () => setDeleteId(null)
                                                        }
                                                    )
                                                }>
                                            Delete Item
                                        </button>
                                        <button className='sub-btn cancel' onClick={() => setDeleteId(null)}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                )
            ) : (
                <div className='empty'>
                    <p>You have no items in your {tab} yet...</p>
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
            {hasNextPage && 
                <div ref={sentinelRef}/>
            }
        </div>
    )
}

export default Items;