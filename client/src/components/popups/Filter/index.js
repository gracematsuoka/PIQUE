import './index.scss';
import {ReactComponent as Close} from '../../../assets/images/icons/close.svg';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';

const Filter = ({className, setShowFilter, colors, setColors, tags, setTags, categs, setCategs, showTags}) => {

    const [optionOpen, setOptionOpen] = useState({
        colors: false,
        tags: false,
        categories: false
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
                <p>COLORS</p>
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
                    <p>TAGS</p>
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
                <p>CATEGORIES</p>
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
            <button className='basic-btn'>Apply</button>
        </div>
    )
}

export default Filter;