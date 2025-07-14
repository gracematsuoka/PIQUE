import './index.scss';
import { useEffect, useState } from 'react';
import WhiteSparkle from '../../../assets/images/icons/sparkle-white.png';
import CheckIcon from '@mui/icons-material/Check';
import blob from '../../../assets/images/home/blob-gradient.png';
import Results from '../Results';

const Style = () => {
    const [input, setInput] = useState('');
    const [selected, setSelected] = useState(['closet']);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (!showResults) {
            setInput('');
            setSelected(['closet']);
        }
    }, [showResults])

    const toggleSelection = (selection) => {
        if (selected.includes(selection) && selected.length === 2) {
            setSelected(prev => prev.filter(opt => opt !== selection));
        } 
        if (!selected.includes(selection)) {
            setSelected(prev => [...prev, selection]);
        }
    }

    return (
        <div className="style">
            <div className="nav-content-wrapper">
                {!showResults && 
                    <div className='style-box'>
                        <h1>Not sure what to wear? <br/>Let AI style it.</h1>
                        <p className='enter-prompt'>Enter a prompt</p>
                        <div className='ai-input'>
                            <input 
                                type='text' 
                                placeholder='ie Bachelorette party on the beach'
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button onClick={() => setShowResults(true)}>
                                <img src={WhiteSparkle}/>
                                <p>Style me</p>
                            </button>
                        </div>
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
                    />
                }
            </div>
        </div>
    )
}

export default Style