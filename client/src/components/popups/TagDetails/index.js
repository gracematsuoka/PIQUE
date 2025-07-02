import './index.scss';
import {ReactComponent as Delete} from '../../../assets/images/icons/delete.svg'
import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { useDeleteTag } from '../../hooks/useMutateTag';


const TagDetails = forwardRef(({name, 
                                setTagDivs, 
                                setAddedTags, 
                                id, 
                                mongoId,
                                style
                            }, ref) => {
    const [tagName, setTagName] = useState(name);
    const deleteTag = useDeleteTag();

    const colors = {
        Red: '#FE9D97',
        Orange: '#FDDCA9',
        Yellow: '#FEF6BF',
        Green: '#E9FEDB',
        Blue: '#CAECFF',
        Purple: '#EACFFE',
        Pink: '#FEE4ED',
        Grey: '#f0f0f0',
        Beige: '#f5ede1'
    }

    useEffect(() => {
        console.log('opened')
    }, [])
    const handleEditTagDiv = (e) => {
        if (e.key === 'Enter') {
            setTagDivs(prev => prev.map(div => 
                div.id === id ? {...div, content: e.target.value, showDetails: false} : div
            ));
            setAddedTags(prev => prev.map(div => 
                div.id === id ? {...div, content: e.target.value, showDetails: false} : div
            ));
        }
    }

    const handleChangeColor = (hex) => {
        setTagDivs(prev => prev.map(div => 
            div.id === id ? {...div, color: hex, showDetails: false} : div
        ));
        setAddedTags(prev => prev.map(div => 
            div.id === id ? {...div, color: hex, showDetails: false} : div
        ))
    }

    const handleDeleteTag = async () => {
        console.log('handle del')
        setTagDivs(prev => prev
                                .map(div => 
                                        div.id === id ? {...div, showDetails: false} : div
                                    )
                                .filter(div => div.id !== id)
                    )
        setAddedTags(prev => prev
                                .map(div => 
                                        div.id === id ? {...div, showDetails: false} : div
                                    )
                                .filter(div => div.id !== id)
                    )

        if (mongoId) {
            deleteTag.mutate({tagId: mongoId});
        }
    }

    return (
        <div className='popup-container add-tag tag-details' ref={ref} style={style}>
            <input type='text' value={tagName} 
                onChange={e => {
                        setTagName(e.target.value);
                    }}
                onKeyDown={e => handleEditTagDiv(e)}
            />
            <div className='sub-btn td-delete' 
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('hedla')
                    handleDeleteTag();
                    }}>
                <p>Delete</p>
                <Delete/>
            </div>
            <hr className='td-line'/>
            <div className='td-color'>
                <p className='colorsP'>Colors</p>
                {Object.entries(colors).map(([color, hex]) => (
                    <div className='sub-btn td-color-option' 
                        key={hex} 
                        onClick={e => {
                                handleChangeColor(hex);
                                }}>
                        <div className='circle' style={{backgroundColor: hex}}/>
                        <p>{color}</p>
                    </div>
                ))}
                
            </div>
        </div>
    )
})

export default TagDetails