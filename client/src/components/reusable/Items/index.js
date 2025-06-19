import { useEffect, useState } from 'react';
import './index.scss';
import { getAuth } from 'firebase/auth';
import ItemDetails from '../../popups/ItemDetails';
// test images
// import blueTank from '../../../assets/images/home/bluetank.png';
// import greySweats from '../../../assets/images/home/greysweats.png';
// import jeans from '../../../assets/images/home/jeans.png';
// import norisktshirt from '../../../assets/images/home/norisktshirt.png';
// import whiteskirt from '../../../assets/images/home/whiteskirt.png';
// import whitetankblouse from '../../../assets/images/home/whitetankblouse.png';
// import sportshoes from '../../../assets/images/home/sportshoes.png';

const Items = ({onSelectItem, reload}) => {
    const [closetItems, setClosetItems] = useState([]);

    // TESING
    // const testClothes = [blueTank, greySweats, jeans, norisktshirt, whiteskirt, whitetankblouse, sportshoes];

    useEffect(() => {
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
        }

        fetchCloset();
    }, [reload]);

    return (
        <div className='items'>
            {closetItems.map(item => 
                <div className='item-wrapper' key={item._id} onClick={() => onSelectItem(item)}>
                    <img src={item.itemRef?.imageURL}/>
                    <div className='item-label'>
                        <circle style={{backgroundColor: item.colors[0].hex}}/>
                        <p>{item.name}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Items;


{/* TESTING 
{testClothes.map((item, index) => 
    <div className='item-wrapper'>
        <img src={item}/>
        <div className='item-label'>
            <circle style={{backgroundColor: "#3D4D66"}}/>
            <p>Item Name</p>
        </div>
    </div>
)}
{testClothes.map((item, index) => 
    <div className='item-wrapper'>
        <img src={item}/>
        <div className='item-label'>
            <circle style={{backgroundColor: "#3D4D66"}}/>
            <p>Item Name</p>
        </div>
    </div>
)} */}