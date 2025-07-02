import './index.scss';
import {ReactComponent as Close} from '../../../assets/images/icons/close.svg';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';

const Filter = ({className, setShowFilter, colors, setColors, tags, setTags}) => {

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
        <div className={className}>
            <div className='close'>
                <Close onClick={e => setShowFilter(false)}/>
            </div>
            <p className='filter-title'>COLORS</p>
            <div className='filter-choices'>
                {colors.map(entry => 
                    <div className='color-filter' key={entry.color} onClick={e => toggleColorChecked(entry.color)}>
                        <div className='circle' style={{backgroundColor: entry.hex}}/>
                        <p>{entry.color}</p>
                        {entry.checked && <Check className='check'/>}
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