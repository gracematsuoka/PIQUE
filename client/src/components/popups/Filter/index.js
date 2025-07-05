import './index.scss';
import {ReactComponent as Close} from '../../../assets/images/icons/close.svg';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';

const Filter = ({
    className, 
    setShowFilter, 
    colors, 
    setColors, 
    tags, 
    setTags, 
    categs, 
    setCategs, 
    showTags,
    style,
    setStyle,
    onApply
    }) => {

    const [optionOpen, setOptionOpen] = useState({
        colors: false,
        tags: false,
        categories: false,
        styles: false
    })

    const toggleTagChecked = (key) => {
        if (showTags)
        setTags(prev => prev.map(tag => 
            tag.key === key ? {...tag, checked: !tag.checked} : tag
        ))
    }

    const toggleColorChecked = (key) => {
        setColors(prev => prev.map(color => 
            color.color === key ? {...color, checked: !color.checked} : color
        ))
    }

    const toggleCategChecked = (key) => {
        setCategs(prev => prev.map(categ => 
            categ.categ === key ? {...categ, checked: !categ.checked} : categ
        ))
    }

    const toggleStyleChecked = (key) => {
        setStyle(prev => prev.map(style => 
            style.style === key ? {...style, checked: !style.checked} : style
        ))
    }

    return (
        <div className={className}>
            <div className='filter-header'>
                <p>Filter</p>
                <div className='close'>
                    <Close onClick={e => setShowFilter(false)}/>
                </div>
            </div>
            <hr/>
            <div className='filter-title' 
                onClick={() => 
                    setOptionOpen(prev => ({
                        ...prev,
                        colors: !prev.colors
                    }))}>
                <p>COLOR</p>
                {optionOpen.colors ? <RemoveIcon/> : <AddIcon/> }
            </div>
            {optionOpen.colors &&
                <div className='filter-choices'>
                    {colors.map(entry => 
                        <div className='color-filter' 
                            key={entry.color} 
                            onClick={e => toggleColorChecked(entry.color)}
                            style={{outline: entry.checked ? '1.2px solid black' : ''}}>
                            <div className='circle' style={{backgroundColor: entry.hex}}/>
                            <p>{entry.color}</p>
                        </div>
                    )}
                </div>
            }
            {showTags && 
                <>
                <div className='filter-title'
                    onClick={() => 
                        setOptionOpen(prev => ({
                            ...prev,
                            tags: !prev.tags
                        }))}>
                    <p>TAG</p>
                    {optionOpen.tags ? <RemoveIcon/> : <AddIcon/> }
                </div>
                {optionOpen.tags && 
                    <div className='filter-choices'>
                        {tags.map(tag => 
                        <>
                            <div className='tag' 
                                key={tag.key} 
                                style={{backgroundColor: tag.hex, outline: tag.checked ? '1px solid black' : ''}} 
                                onClick={e => toggleTagChecked(tag.key)}
                            > 
                                <div className='circle-check' style={{backgroundColor: tag.checked ? 'black' : ''}}>
                                    {tag.checked ? <Check/> : null}
                                </div> 
                                <p>{tag.name}</p>
                            </div>
                        </>
                        )}
                    </div>
                }
                </>
            }
            <div className='filter-title'
                onClick={() => 
                    setOptionOpen(prev => ({
                        ...prev,
                        categories: !prev.categories
                    }))}>
                <p>CATEGORY</p>
                {optionOpen.categories ? <RemoveIcon/> : <AddIcon/> }
            </div>
            {optionOpen.categories && 
                <div className='filter-choices'>
                    {categs.map(categ => 
                    <>
                        <div className='tag' 
                            key={categ.categ} 
                            style={{backgroundColor: 'rgba(128, 128, 128, 0.114)', outline: categ.checked ? '1px solid black' : ''}} 
                            onClick={e => toggleCategChecked(categ.categ)}
                        > 
                            <div className='circle-check' style={{backgroundColor: categ.checked ? 'black' : ''}}>
                                {categ.checked ? <Check/> : null}
                            </div> 
                            <p>{categ.categ}</p>
                        </div>
                    </>
                    )}
                </div>
            }
            <div className='filter-title'
                onClick={() => 
                    setOptionOpen(prev => ({
                        ...prev,
                        styles: !prev.styles
                    }))}>
                <p>TYPE</p>
                {optionOpen.styles ? <RemoveIcon/> : <AddIcon/> }
            </div>
            {optionOpen.styles && 
                <div className='filter-choices'>
                    {style.map(style => 
                    <>
                        <div className='tag' 
                            key={style.style} 
                            style={{backgroundColor: 'rgba(128, 128, 128, 0.114)', outline: style.checked ? '1px solid black' : ''}} 
                            onClick={e => toggleStyleChecked(style.style)}
                        > 
                            <div className='circle-check' style={{backgroundColor: style.checked ? 'black' : ''}}>
                                {style.checked ? <Check/> : null}
                            </div> 
                            <p>{style.style}</p>
                        </div>
                    </>
                    )}
                </div>
            }
            <div className='basic-btn-wrapper'>
                <button className='basic-btn'
                    onClick={() => {
                        setShowFilter(false);
                        onApply();
                    }}
                >
                    Apply
                </button>
            </div>
        </div>
    )
}

export default Filter;