import './index.scss';
import {ReactComponent as More} from '../../../assets/images/icons/more.svg'
import {ReactComponent as Add} from '../../../assets/images/icons/add.svg'
import TagDetails from '../TagDetails';
import { forwardRef, useState, useEffect, useRef } from 'react';

const AddTag = forwardRef((addTagProps, ref) => {
    const {tagDivs, setTagDivs, addedTags, setAddedTags, showAddTag, setShowAddTag} = addTagProps;
    const [tagName, setTagName] = useState('');
    const detailsRefs = useRef({});
    const moreRefs = useRef({});

    useEffect(() => {
        const handleClickOutside = (e) => {
            setTagDivs(prev => prev.map(div => {
                if (div.showDetails && 
                    detailsRefs.current[div.id] && 
                    !detailsRefs.current[div.id].contains(e.target) && 
                    moreRefs.current[div.id] && 
                    !moreRefs.current[div.id].contains(e.target)) {
                    return {...div, showDetails: false};
                }
                return div;
            }))   
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])

    function createTagDiv(content) {
        return {
            id: Date.now() + Math.random(),
            content: content || '',
            color: '#f0f0f0',
            showDetails: false,
            mongoId: '',
            updated: false
        }
    }

    const toggleDetails = (id) => {
        setTagDivs(prev => prev.map(div => {
            if (div.id === id) {
                return { ...div, showDetails: !div.showDetails };
            }
            return { ...div, showDetails: false };
        }))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const tagDiv = createTagDiv(e.target.value);
            addDiv(tagDiv);
            addTag(tagDiv);
            setShowAddTag(!showAddTag);
        }
    }

    const addDiv = (tagDiv) => {
        setTagDivs(prev => [...prev, tagDiv]);
    }

    const addTag = (tagDiv) => {
        setAddedTags(prev => [...prev, tagDiv]);
    }

    const tagAdded = (id) => {
        return addedTags.some(tag => tag.id === id);
    }

    return (
        <div className='popup-container add-tag' ref={ref}>
            <div className='tag-detail-wrapper'>
                    {tagDivs.map(div => 
                        <div className='tag-detail' key={div.id}>
                            <div className='sub-btn' onClick={e => {!tagAdded(div.id) && addTag(div)}}>
                                <div className='tag' style={{backgroundColor: div.color}}>
                                    <p>{div.content}</p>
                                </div>
                            </div>
                            <div className='more-details'>
                                <div onClick={e => toggleDetails(div.id)} ref={el => (moreRefs.current[div.id] = el)}>
                                    <More/>
                                </div>
                                {div.showDetails && <TagDetails 
                                                        className='tag-details' 
                                                        ref={el => (detailsRefs.current[div.id] = el)} 
                                                        name={div.content} setTagDivs={setTagDivs} 
                                                        setAddedTags={setAddedTags} 
                                                        id={div.id} 
                                                        mongoId={div.mongoId}
                                                        />}
                            </div>
                        </div>
                    )}
            </div>
            <div className='create-tag'>
                <input type='text' placeholder='Create new tag' value={tagName} onKeyDown={e => handleKeyDown(e)} onChange={e => setTagName(e.target.value)}/>
                <Add onClick={e => {
                    const tagDiv = createTagDiv(tagName);
                    addDiv(tagDiv);
                    addTag(tagDiv);
                    setShowAddTag(!showAddTag);
                }}/>
            </div>
        </div>
    )
})

export default AddTag;