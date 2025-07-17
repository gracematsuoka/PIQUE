import './index.scss';
import { useEffect, useState } from 'react';
import WhiteSparkle from '../../../assets/images/icons/sparkle-white.png';
import CheckIcon from '@mui/icons-material/Check';
import { auth } from '../../../firebase';
import Results from '../Results';
import { fetchWithError } from '../../../utils/fetchWithError';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useItems } from '../../hooks/useItems';

const Style = () => {
    const [input, setInput] = useState('');
    const [selected, setSelected] = useState(['closet']);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const [tries, setTries] = useState(5);
    const [plus, setPlus] = useState(false);
    const navigate = useNavigate();
    const {data:closetData} = useItems({tab: 'closet', query: '', filters: ''});
    const {data:wishlistData} = useItems({tab: 'wishlist', query: '', filters: ''});

    useEffect(() => {
        if (!showResults) {
            setInput('');
            setSelected(['closet']);
        }
        if (!plus && tries <= 0) {
            setError("You've used all 5 tries, thank you for trying out PIQUE AI.")
        }
    }, [showResults, closetData])

    useEffect(() => {
        setError('')
        if (selected.includes('closet') && closetData?.pages[0].items.length === 0) {
            setError(`Add items to your closet to get styled`);
        } else if (selected.includes('wishlist') && wishlistData?.pages[0].items.length === 0) {
            setError(`Add items to your wishlist to get styled`);
        }
    }, [closetData, wishlistData, selected])

    useEffect(() => {
        checkTriesLeft();
    }, [])

    const toggleSelection = (selection) => {
        if (selected.includes(selection) && selected.length === 2) {
            setSelected(prev => prev.filter(opt => opt !== selection));
        } 
        if (!selected.includes(selection)) {
            setSelected(prev => [...prev, selection]);
        }
    }

    const checkTriesLeft = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const { plusStat, triesLeft } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/check-plus`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTries(triesLeft);
            setPlus(plusStat);

            if (!plusStat && triesLeft <= 0) {
                setError("You've used all 5 tries, thank you for trying out PIQUE AI.")
            }
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }
    } 

    const handleSubscribe = async () => {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/plus/create-checkout-session`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`
        }
        });
      
        const { url } = await res.json();
        window.location.href = url;
    };      

    return (
        <div className="style">
            <div className="nav-content-wrapper">
                {!showResults && 
                    <div className='style-box'>
                        <h1>Not sure what to wear? <br/>Let AI style it.</h1>
                        <div className='beta'>
                            <ErrorOutlineIcon/>
                            <p>Beta</p>
                        </div>
                        <p className='enter-prompt'>Enter a prompt</p>
                        <div className='ai-input' style={{opacity: error ? '0.5' : '1'}}>
                            <input 
                                type='text' 
                                placeholder='ie Bachelorette party on the beach'
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={error ? true : false} 
                            />
                            <button disabled={error ? true : false} 
                                style={{pointerEvents: error ? 'none' : 'auto'}}
                                onClick={() => setShowResults(true)}>
                                <img src={WhiteSparkle}/>
                                <p>Style me</p>
                            </button>
                        </div>
                        {error && 
                            <div className='subscription'>
                                <div className='error' style={{textAlign: 'center'}}><p>{error}</p></div>
                                {/* <button className='basic-btn' onClick={() => handleSubscribe()}>Subscribe</button> */}
                            </div>
                        }
                        <div className='style-select'>
                            <p>Include items from my</p>
                            <div className='style-opt' 
                                style={{backgroundColor: selected.includes('closet') ? '#959595' : ''}}
                                onClick={() => toggleSelection('closet')}>
                                <p>closet</p>
                                {selected.includes('closet') && <CheckIcon/>}
                            </div>
                            <div className='style-opt'
                                style={{backgroundColor: selected.includes('wishlist') ? '#959595' : ''}}
                                onClick={() => toggleSelection('wishlist')}>
                                <p>wishlist</p>
                                {selected.includes('wishlist') && <CheckIcon/>}
                            </div>
                        </div>
                    </div>
                }
                {showResults &&
                    <Results
                        input={input}
                        selected={selected}
                        setShowResults={setShowResults}
                        tries={tries}
                        setTries={setTries}
                        plus={plus}
                    />
                }
            </div>
        </div>
    )
}

export default Style