import { useEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import {ReactComponent as More} from '../../../assets/images/icons/more.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import addClothes from "../../../assets/images/icons/addclothes.png";
import { Bouncy } from 'ldrs/react';
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg';
import { useItems } from '../../hooks/useItems';
import { useDeleteItem } from '../../hooks/useMutateItems';
import SearchBar from '../../reusable/SearchBar';
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg';
import { useTag } from '../../hooks/useTag';
import Filter from '../../popups/Filter';
import { useAuth } from '../../../contexts/AuthContext';

const Items = ({onSelectItem, tab, handleError, colorMap, itemArray}) => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState([]);
    const [input, setInput] = useState('');
    const {mongoUser} = useAuth();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useItems({tab, query, filters})

    const onSearch = (input) => {
        setQuery(input);
    }

    useEffect(() => {
        setQuery('');
        setFilters({});
        setInput('');
    }, [tab])

    const deleteItem = useDeleteItem();
    const items = data?.pages.flatMap(page => page.items) || [];
    const [selectedId, setSelectedId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const sentinelRef = useRef(null);
    const [showFilter, setShowFilter] = useState(false);
    const [tags, setTags] = useState([]);
    const [categs, setCategs] = useState([]);
    const [colors, setColors] = useState([]);
    const [style, setStyle] = useState([]);

    const styleArray = ['Women', 'Men', 'Unisex']

    const {data: dbTags=[]} = useTag();

    useEffect(() => {
        setTags(dbTags.map(tag => ({
            name: tag.name,
            hex: tag.hex,
            key: tag._id,
            checked: false
        })));
        const colorCheckMap = Object.keys(colorMap)
            .map(color => ({
                    color,
                    hex: colorMap[color],
                    checked: false
                })
        );
        setColors(colorCheckMap)

        setCategs(itemArray.map(item => ({
            categ: item,
            checked: false
        })));

        setStyle(styleArray.map(style => ({
            style,
            checked: style === mongoUser?.pref ? true : false
        })))
    }, [dbTags]) 

    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
        )
        if (sentinelRef.current){
            observer.observe(sentinelRef.current)
        };

        return () => observer.disconnect();
    }, [hasNextPage]);

    const filterObj = useMemo(() => ({
        colors: colors.filter(color => color.checked).map(color => color.color),
        categories: categs.filter(categ => categ.checked).map(categ => categ.categ),
        tags: tags.filter(tag => tag.checked).map(tag => tag.name),
        styles: style.filter(style => style.checked).map(style => style.style)
    }), [colors, categs, tags, style]);

    const onApply = () => {
        setFilters(filterObj);
    }

    return (
        <div className='items-wrap'>
        <Filter className={`popup-container filter ${showFilter ? 'open' : ''}`} 
                setShowFilter={setShowFilter}
                tags={tags}
                setTags={setTags}
                colors={colors}
                setColors={setColors}
                categs={categs}
                setCategs={setCategs}
                showTags={true}
                style={style}
                setStyle={setStyle}
                onApply={onApply}
        />
        <div className="search-filter">
            <SearchBar
                onSearch={onSearch}
                input={input}
                setInput={setInput}
            />
            <div className="filter" onClick={e => setShowFilter(!showFilter)}>
                <p>Filter</p>
                <FilterIcon/>
            </div>
        </div>
        <div className='items'>
            {(isLoading || isFetchingNextPage) ? (
                <Bouncy
                    size="45"
                    speed="1.75"
                    color="#6B799F"
                    />
            ) : items.length > 0 ? (
                items.map(item => 
                    <div className='item-wrapper' key={item._id}>
                        <img loading='lazy' 
                            src={item.itemRef?.imageURL}
                            alt={item.name}
                            />
                        <div className='item-label'>
                            {/* <circle style={{backgroundColor: item.colors[0].hex}}/> */}
                            <p>{item.name}</p>
                        </div>
                        <div className='more' onClick={e => setSelectedId(prev => prev === item._id ? null : item._id)}>
                            <More />
                            {(selectedId === item._id) && 
                            <div className='mini-pop'>
                                <div className='sub-btn' onClick={e => setDeleteId(item._id)}>
                                    <DeleteIcon/>
                                    <p>Delete</p>
                                </div>
                                <div className='sub-btn' onClick={() => onSelectItem(item)}>
                                    <EditRoundedIcon/>
                                    <p>Edit</p>
                                </div>
                            </div>
                            }
                        </div>
                        {deleteId && 
                            <>
                                <div className="popup-overlay"></div>
                                <div className="popup-container overlay">
                                    <div className='x' onClick={() => setDeleteId(null)}>
                                        <CloseIcon/>
                                    </div>
                                    <div className='popup-content'>
                                        <p className='popup-name'>🚨 Warning</p>
                                        <p>Deleting an item cannot be undone</p>
                                        <button className='sub-btn' 
                                                onClick={() => 
                                                    deleteItem.mutate(
                                                        {itemId: deleteId, tab},
                                                        {
                                                            onError: (err) => handleError(err),
                                                            onSettled: () => setDeleteId(null)
                                                        }
                                                    )
                                                }>
                                            Delete Item
                                        </button>
                                        <button className='sub-btn cancel' onClick={() => setDeleteId(null)}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                )
            ) : (
                <div className='empty'>
                    <p>No items found...</p>
                    <div className='empty-h1'>
                        <h1>Click </h1>
                        <div className='add-icon'>
                            <img src={addClothes}/>
                        </div>
                        <h1> to add items</h1>
                    </div>
                    <h1>↪</h1>
                </div>
            )}
            {hasNextPage && 
                <div ref={sentinelRef}/>
            }
        </div>
        </div>
    )
}

export default Items;