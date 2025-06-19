import { useEffect, useState } from 'react';
import './index.scss';
import { getAuth } from 'firebase/auth';
import addClothes from "../../../assets/images/icons/addclothes.png"

const Items = ({onSelectItem, reload}) => {
    const [closetItems, setClosetItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchCloset = async () => {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
    
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-items/get-closet`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
    
            const data = await res.json();
            setClosetItems(data.items);
            setLoading(false);
        }

        fetchCloset();
    }, [reload]);

    return (
        <div className='items'>
            {loading ? null : closetItems.length > 0 ? (
                closetItems.map(item => 
                    <div className='item-wrapper' key={item._id} onClick={() => onSelectItem(item)}>
                        <img loading='lazy' 
                            src={item.itemRef?.imageURL.replace('/public', '/300')}
                            alt={item.name}
                            />
                        <div className='item-label'>
                            <circle style={{backgroundColor: item.colors[0].hex}}/>
                            <p>{item.name}</p>
                        </div>
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