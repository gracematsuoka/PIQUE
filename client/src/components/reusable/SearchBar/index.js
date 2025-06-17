import './index.scss'
import {ReactComponent as SearchIcon} from '../../../assets/images/icons/search.svg'

const SearchBar = () => {
    return (
        <div className='search-bar'>
            <input type='text' placeholder='Search'/>
            <SearchIcon/>
        </div>
    )
}

export default SearchBar;