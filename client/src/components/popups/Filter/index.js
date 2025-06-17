import './index.scss';
import {ReactComponent as Close} from '../../../assets/images/icons/close.svg';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';

const Filter = (props) => {
    const {setShowFilter, colors, setColors, tags, setTags} = props

    const toggleTagChecked = (key) => {
        setTags(prev => prev.map(tag => 
            tag.key === key ? {...tag, checked: !tag.checked} : tag
        ))
    }

    const toggleColorChecked = (key) => {
        setColors(prev => prev.map(color => 
            color.hex === key ? {...color, checked: !color.checked} : color
        ))
    }

    return (
        <div className="popup-container filter">
            <div className='close'>
                <Close onClick={e => setShowFilter(false)}/>
            </div>
            <p className='filter-title'>COLORS</p>
            <div className='filter-choices'>
                {colors.map(color => 
                    <div className='color-filter' key={color.hex} onClick={e => toggleColorChecked(color.hex)}>
                        <div className='circle' style={{backgroundColor: color.hex}}/>
                        <p>{color.color}</p>
                        {color.checked && <Check className='check'/>}
                    </div>
                )}
            </div>
            <p className='filter-title'>TAGS</p>
            <div className='filter-choices'>
                {tags.map(tag => 
                    <div className='tag' 
                        key={tag.key} 
                        style={{backgroundColor: tag.hex}} 
                        onClick={e => toggleTagChecked(tag.key)}>
                        <p>{tag.name}</p>
                        {tag.checked && <Check className='check'/>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Filter;