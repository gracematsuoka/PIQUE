import './index.scss'
import {ReactComponent as SearchIcon} from '../../../assets/images/icons/search.svg'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const SearchBar = ({onSearch, input, setInput}) => {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/closet') {
            setInput('');
        }
        if (location.pathname === '/closet/wishlist') {
            setInput('');
        }
    }, [location])


    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            if (!input.trim()) return;
            onSearch(input);
        }
    }

    return (
        <div className='search-bar'>
            <input 
                type='text' 
                placeholder='Search' 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={e => handleSearch(e)}
            />
            <hr/>
            <div className='search-icon'>
                <SearchIcon/>
            </div>

            {input && 
                <div className='search-close' 
                    onClick={() => {
                        setInput('');
                        onSearch('');
                    }}>
                    <CloseIcon/>
                </div>
            }
        </div>
    )
}

export default SearchBar;