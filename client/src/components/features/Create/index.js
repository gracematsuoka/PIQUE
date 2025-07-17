import './index.scss';
import SearchBar from "../../reusable/SearchBar";
import Filter from "../../popups/Filter";
import { useRef, useState, useEffect, useMemo } from "react";
import Select, {components} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {Canvas, FabricImage, Textbox} from "fabric";
import CanvasHistory from "../../../utils/CanvasHistory";
import Tooltip from "@mui/material/Tooltip";
import Congrats from "../../popups/Congrats";
import { useItems } from "../../hooks/useItems";
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg'
import { useTag } from '../../hooks/useTag';
// toolbar
import UndoRoundedIcon from '@mui/icons-material/UndoOutlined';
import RedoRoundedIcon from '@mui/icons-material/RedoOutlined';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensOutlined';
import CropPortraitRoundedIcon from '@mui/icons-material/CropPortraitOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEdit';
import CropDinIcon from '@mui/icons-material/CropDin';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PostPrev from "../../popups/PostPrev";
import { Bouncy } from 'ldrs/react';
import { useAuth } from '../../../contexts/AuthContext';

const Create = () => {
    const {mongoUser} = useAuth();
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [canvasHistory, setCanvasHistory] = useState(null);
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isItalics, setIsItalics] = useState(false);
    const [showTextColors, setShowTextColors] = useState(false);
    const [textFill, setTextFill] = useState('');
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showSizeOptions, setShowSizeOptions] = useState(false);
    const [sizeOption, setSizeOption] = useState('outfit');
    const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [font, setFont] = useState(null);
    const [menu, setMenu] = useState({visible: false, x: 0, y: 0, target: null});
    const clipboardRef = useRef(null);
    const [textSize, setTextSize] = useState(null);
    const [title, setTitle] = useState('');
    const [showPost, setShowPost] = useState(false);
    const [postURL, setPostURL] = useState('');
    const [canvasJSON, setCanvasJSON] = useState('');
    const [showCongrats, setShowCongrats] = useState(false);
    const [reload, setReload] = useState(false);
    const sentinelRef = useRef(null);
    const [showFilter, setShowFilter] = useState(false);
    const [tags, setTags] = useState([]);
    const [categs, setCategs] = useState([]);
    const [colors, setColors] = useState([]);
    const [style, setStyle] = useState([])
    const [showTags, setShowTags] = useState(true)
    const [tab, setTab] = useState('closet');
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState([]);
    const [input, setInput] = useState('');
    const stableQuery = useMemo(() => query, [query])
    const stableFilters = useMemo(() => filters, [filters]);
    const stableTab = useMemo(() => tab, [tab]);
    const scrollRef = useRef(null);

    // set items to the correct tab
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useItems({tab: stableTab, query: stableQuery, filters: stableFilters})
    const items = data?.pages.flatMap(page => page.items) || [];

    const onSearch = (input) => {
        setQuery(input);
    }

    // fetch more items
    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (entry.isIntersecting && scrollRef.current) {
                    const prevScrollHeight = scrollRef.current.scrollHeight;
                    const prevScrollTop = scrollRef.current.scrollTop;
                    await fetchNextPage();

                    requestAnimationFrame(() => {
                        const newScrollHeight = scrollRef.current.scrollHeight;
                        const diff = newScrollHeight - prevScrollHeight;
                        scrollRef.current.scrollTop = prevScrollTop + diff;
                    })
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

    const handleSwitchTab = (selected) => {
        if (selected === tab) return; 
        setTab(selected);
        if (selected === 'closet' || selected === 'wishlist') {
            setShowTags(true);
        } else {
            setShowTags(false);
        }
    }

    // filter
    const colorMap = {
        'Red': '#F35050',
        'Orange': '#EEA34E',
        'Yellow': '#F5D928',
        'Green': '#91D58C',
        'Blue': '#81AAEA',
        'Purple': '#BE9FE5',
        'Pink': '#F1AFD6',
        'Black': '#000000',
        'Grey': '#868585',
        'White': '#FFFFFF',
        'Beige': '#E9E0B6',
        'Brown': '#A26D2C',
        'Gold': '#D6CE85',
        'Silver': '#E8E5E0',
        'Rose Gold': '#D6AA90'
    }

    const itemArray = ['Tops', 'Bottoms', 'Dresses/Rompers', 'Outerwear', 'Shoes', 'Swimwear',
        'Sets', 'Undergarments', 'Jewelry', 'Bags', 'Accessories', 'Other'
    ]

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
            checked: style === mongoUser?.pref || style === 'Unisex' ? true : false
        })))
    }, [dbTags]);

    const filterObj = useMemo(() => ({
        colors: colors.filter(color => color.checked).map(color => color.color),
        categories: categs.filter(categ => categ.checked).map(categ => categ.categ),
        tags: tags.filter(tag => tag.checked).map(tag => tag.key),
        styles: style.filter(style => style.checked).map(style => style.style)
    }), [colors, categs, tags, style]);

    const onApply = () => {
        setFilters(filterObj);
    }

    useEffect(() => {
        setQuery('');
        setFilters({});
        setInput('');
    }, [tab])

    // canvas functionality 
    const hexCodes = ['#A36361', '#C96349', '#F7A87B', '#E9CE83', 
            '#919568', '#8FAE95', '#B4D2C0', '#F9D994',
            '#5E99A3', '#84BAC0', '#B7D2D7', '#CBBCCF', 
            '#AD92B1', '#E7A396', '#F2C5C6', '#D5B3A1',
            '#f8f8f8', '#000000', '#9b9b9b']

    const fonts = ['Just Me Again Down Here', 'Merriweather', 'Inter', 'Roboto',
        'Open Sans', 'Oswald', 'Playfair Display', 'Caprasimo', 'PT Serif', 'Outfit',
        'Cedarville Cursive', 'Caveat','Shadows Into Light', 'Patrick Hand','Syne',
        'Oi', 'Archivo Black', 'Fahkwang', 'IBM Plex Sans'
    ].map(font => ({value: font, label: font}));

    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 
        32, 36, 48, 64, 72].map(num => ({value: num, label: num.toString()}));

    const customStyles = {
        control: (provided, state) => ({
          ...provided,
          background: '#fff',
          borderColor: '#9e9e9e',
          minHeight: '20px',
          height: '20px',
          width: '100px',
          boxShadow: state.isFocused ? null : null,
        }),
        valueContainer: (provided, state) => ({
          ...provided,
          height: '20px',
          padding: '0 2px'
        }),
        input: (provided, state) => ({
          ...provided,
          margin: '0px',
        }),
        indicatorSeparator: state => ({
          display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
          ...provided,
          height: '20px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0 1px',
            fontSize: '12px',
            transform: 'scale(0.7)',
        }),
        singleValue: (provided) => ({
        ...provided,
        fontSize: '12px',
        }),
        option: (provided, state) => ({
        ...provided,
        padding: '8px 12px',
        borderRadius: '5px',
        fontSize: '12px',
        backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
        color: 'black',
        }),
    };

    const numCustomStyles = {
        ...customStyles,
        control: (provided, state) => ({
            ...customStyles.control(provided, state),
            width: '45px',
        }),
        singleValue: (provided) => ({
            ...customStyles.singleValue(provided),
            textOverflow: 'clip',
            margin: '0'
        }),
        dropdownIndicator: (provided) => ({
            ...customStyles.dropdownIndicator(provided),
            padding: '0 0px',
            fontSize: '12px',
            transform: 'scale(0.7)',
        }),
    }

    const FontOption = (props) => {
        const { data } = props;
        useEffect(() => {
            loadGoogleFont(data.value);
        }, [data.value]);

        return (
            <components.Option {...props}>      
                <span style={{ fontFamily: data.value }}>{data.label}</span>
            </components.Option>
        )
    }

    const loadGoogleFont = (font) => {
        const fontId = font.replace(/\s+/g, '');
        if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    };

    useEffect(() => {
        setTitle('');
        if(canvasRef.current) {
            setCanvas(null);
            const fabricCanvas = new Canvas(canvasRef.current, {
                width: 400,
                height: 600,
                selection: true,
                fireRightClick: true,
                stopContextMenu: true,
                isDragging: false,
                lastPosX: 0,
                lastPosY: 0,
            })
            fabricCanvas.backgroundColor='#f8f8f8'
            fabricCanvas.renderAll();

            setCanvas(fabricCanvas);
            const canvasHistory = new CanvasHistory(fabricCanvas);
            setCanvasHistory(canvasHistory);

            return () => {
                fabricCanvas.dispose();
            }
        }
    }, [reload])

    useEffect(() => {
        if (!canvas) return;

        const syncCanvas = () => {
            const activeObject = canvas.getActiveObject();

            if (!activeObject) {
                setShowTextOptions(false);
                setShowBackgroundOptions(false);
                setShowImageOptions(false);
                setShowSizeOptions(false);
                setIsBold(false);
                setIsUnderline(false);
                setIsItalics(false);
                setShowTextColors(false);
                setFont(null);
                setTextFill(null);
                return;
            }
            if (activeObject.type === 'textbox') {
                setShowTextOptions(true);
                if (activeObject.fontWeight === 700) {
                    setIsBold(true);
                }
                if (activeObject.underline === true) {
                    setIsUnderline(true);
                }
                if (activeObject.fontStyle === 'italic') {
                    setIsItalics(true);
                }
                setFont({value: activeObject.fontFamily, label: activeObject.fontFamily});
                setTextSize({value: activeObject.fontSize, label: activeObject.fontSize.toString()})
            }
        }

        const handleKeyDown = async (e) => {
            const el = document.activeElement;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.isEditing) return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                  e.preventDefault();
                  canvasHistory.undo();
                  return;
                } 
                if (e.key === 'z' && e.shiftKey || e.key === 'y') {
                    e.preventDefault();
                    canvasHistory.undo();
                    return;
                }
                if (e.key === 'b') {
                    toggleBold();
                    return;
                }
                if (e.key === 'u') {
                    toggleUnderline();
                    return;
                }
                if (e.key === 'i') {
                    toggleItalics();
                    return;
                }

                const activeObjects = canvas.getActiveObjects();
                if (!activeObjects) return;
                if (e.key === 'c') {
                    const clone = await activeObjects.clone();
                    clipboardRef.current = clone;
                }
                if (e.key === 'v') {
                    if(clipboardRef.current) {
                        const clone = await clipboardRef.current.clone();
                        clone.set({
                            left: clipboardRef.current.left + 10,
                            top: clipboardRef.current.top + 10,
                            evented: true,
                          });
                        canvas.discardActiveObject();
                        canvas.add(clone);
                        canvas.setActiveObject(clone);
                        clipboardRef.current = clone;
                        canvas.renderAll();
                    }
                }
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects.length > 0) {
                    canvas.remove(...activeObjects);
                    canvas.discardActiveObject();
                    canvas.fire('custom:added');
                }
            }
        }

        const handleContextMenu = opt => {
            if (opt.e.button === 2) {
                const target = opt.target;
                if (target) {
                    showContextMenu({
                        x: opt.e.pageX,
                        y: opt.e.pageY,
                        object: target
                    });
                } else {
                    hideContextMenu();
                }
            } else {
                hideContextMenu();
            }
        }

        canvas.on('mouse:down', handleContextMenu);
        canvas.on('selection:created', syncCanvas);
        canvas.on('selection:cleared', syncCanvas);
        canvas.on('selection:updated', syncCanvas);
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            canvas.off('selection:created', syncCanvas);
            canvas.off('selection:cleared', syncCanvas);
            canvas.off('selection:updated', syncCanvas);
            canvas.off('mouse:down', handleContextMenu);
        }
    }, [canvas]);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const suppress = e => {
            if (canvas.contains(e.target)) e.preventDefault();
        }

        document.addEventListener('contextmenu', suppress, {capture: true});
        return () => document.removeEventListener('contextmenu', suppress, {capture: true})
    }, [])

    const showContextMenu = ({x, y, object}) => {
        setMenu({visible: true, x, y, target: object});
    }

    const hideContextMenu = () => {
        setMenu(prev => ({...prev, visible: false}));
    }

    useEffect(() => {
        const listener = () => hideContextMenu();
        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, [canvas])

    const getSelectedText = () => {
        const activeObject = canvas.getActiveObject();
        return (activeObject && activeObject.type === 'textbox') ? activeObject : null;
    }

    const toggleBold = () => {
        const textObject = getSelectedText();
        if (textObject) {
            const currentWeight = textObject.fontWeight;
            textObject.set('fontWeight', currentWeight === 700 ? 400 : 700);
            textObject.fontWeight === 700 ? setIsBold(true) : setIsBold(false);
            canvas.fire('custom:added');
            canvas.requestRenderAll();
        }
    }

    const toggleUnderline = () => {
        const textObject = getSelectedText();
        if (textObject) {
            const underline = textObject.underline;
            textObject.set('underline', underline ? false : true);
            textObject.underline ? setIsUnderline(true) : setIsUnderline(false);
            canvas.fire('custom:added');
            canvas.requestRenderAll();
        }
    }
      
    const toggleItalics = () => {
        const textObject = getSelectedText();
        if (textObject) {
            const italics = textObject.fontStyle;
            textObject.set('fontStyle', italics === '' ? 'italic' : '');
            textObject.fontStyle === 'italic' ? setIsItalics(true) : setIsItalics(false);
            canvas.fire('custom:added');
            canvas.requestRenderAll();
        }
    }

    const handleTextFill = (hex) => {
        const textObject = getSelectedText();
        if (textObject) {
            textObject.set('fill', hex);
            canvas.fire('custom:added');
            canvas.requestRenderAll();
        }
    }

    const handleBgColor = (hex) => {
        canvas.backgroundColor = hex;
        canvas.fire('custom:added');
        canvas.requestRenderAll();
    }    

    const handleFont = (font) => {
        loadGoogleFont(font);
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set('fontFamily', font);
            canvas.fire('custom:added');
            canvas.requestRenderAll();
        }
    }

    const handleTextSize = (size) => {
        try {
            const numSize = parseFloat(size);
            if (isNaN(numSize)) return;
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'textbox') {
                activeObject.set('fontSize', numSize);
                canvas.fire('custom:added');
                canvas.requestRenderAll();
            }
        } catch {
            return;
        }
    }

    const handleCanvasSize = (size) => {
        if (size === 'outfit') {
            canvas.setWidth(400);
            canvas.setHeight(600);
        } else if (size === 'collection') {
            canvas.setWidth(500);
            canvas.setHeight(500);
        }
        canvas.fire('custom:added');
        canvas.renderAll();
    }

    const handleDragStart = (e, item) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(item));

        e.dataTransfer.setDragImage(e.target, e.target.width / 2, e.target.height / 2);
    }

    const handleDrop = async (e) => {
        e.preventDefault();
        
        const data = JSON.parse(e.dataTransfer.getData('application/json'));

        const { x, y } = canvas.getPointer(e.nativeEvent);

        const img = await FabricImage.fromURL(data.itemRef?.imageURL || data.imageURL,
            {crossOrigin: 'anonymous'});

        img.toObject = function(propertiesToInclude) {
            return {
                ...Object.getPrototypeOf(this).toObject.call(this, propertiesToInclude),
                itemId: this.itemId
            };
        };

        img.set({
            left: x,
            top: y,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            scaleX:0.5,
            scaleY:0.5,
            itemId: data.itemRef?._id || data._id 
        })

        canvas.add(img)
    }

    const addImage = async (item) => {
        const img = await FabricImage.fromURL(item.itemRef?.imageURL || item.imageURL,
            {crossOrigin: 'anonymous'});

        img.toObject = function(propertiesToInclude) {
            return {
                ...Object.getPrototypeOf(this).toObject.call(this, propertiesToInclude),
                itemId: this.itemId
            };
        };

        img.set({
            left: 50,
            top: 50,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            scaleX:0.5,
            scaleY:0.5,
            itemId: item.itemRef?._id || item._id 
        })

        canvas.add(img)
    }

    const addText = async () => {
        const text = new Textbox('Text',{
            left: 50,
            top: 50,
            fontFamily: 'Inter',
            editable: true,
            fontWeight: 'normal',
            underline: false,
            fontStyle: '',
            fontSize: 32
        })

        canvas.add(text);
        canvas.fire('custom:added');
        canvas.setActiveObject(text);
        canvas.renderAll();
    }

    const handleSave = () => {
        const json = canvas.toJSON(['itemId'], true);
        const dataURL = canvas.toDataURL({format: 'png', multiplier: 2})     
    }
    
    const handlePost = () => {
        const json = canvas.toJSON(['itemId'], true);
        const dataURL = canvas.toDataURL({format: 'png', multiplier: 3})
        setCanvasJSON({
            objects: json.objects,
            width: canvas.width,
            height: canvas.height,
            background: canvas.backgroundColor
        });
        setPostURL(dataURL);
        setShowPost(true);
    }

    useEffect(() => {
        console.log('pages:', data?.pages?.length);
        console.log('items', data)
      }, [data?.pages]);

    return (
        <div className="create">
                {showCongrats && <Congrats
                                    setShowCongrats={setShowCongrats}
                                    setReload={setReload}
                />}
                {showPost && <PostPrev
                                canvasJSON={canvasJSON}
                                postURL={postURL}
                                title={title}
                                setTitle={setTitle}
                                setShowPost={setShowPost}
                                setShowCongrats={setShowCongrats}
                />}
                <hr/>
                <div className="create-wrapper">
                    <div className="create-board">
                        <div className="create-top">
                            <div className="input-wrapper">
                                <input type='text' placeholder="Title goes here..." value={title} onChange={e => setTitle(e.target.value)}/>
                            </div>
                            <div className="toolbar">
                                <div className='toolbar-icon' onClick={() => canvasHistory.undo()}>
                                    <UndoRoundedIcon/>
                                </div>
                                <div className="toolbar-icon" onClick={() => canvasHistory.redo()}>
                                    <RedoRoundedIcon/>
                                </div>
                                <hr/>
                                <Tooltip title='Add text'>
                                <div className={`toolbar-icon ${showTextOptions && 'active'}`} 
                                    onClick={() => {
                                            addText();
                                            setShowTextOptions(true);
                                            setShowBackgroundOptions(false);
                                            setShowSizeOptions(false);
                                    }}>
                                    <p>T</p>
                                </div>
                                </Tooltip>
                                {showTextOptions && 
                                    <div className="toolbar sub">
                                        <Select className="font-select"
                                                options={fonts}
                                                onChange={(selected) => {
                                                    handleFont(selected.value);
                                                }}
                                                placeholder='Inter'
                                                styles={customStyles}
                                                components={{ Option: FontOption }}
                                                value={font}
                                        />
                                        <CreatableSelect className="font-select"
                                            options={fontSizes}
                                            styles={numCustomStyles}
                                            placeholder='32'
                                            value={textSize}
                                            onChange={(selected) => {
                                                handleTextSize(selected.value)
                                            }}
                                        />
                                        <div className={`toolbar-icon ${isBold && 'active'}`}  onClick={toggleBold}>
                                            <FormatBoldOutlinedIcon/>
                                        </div>
                                        <div className={`toolbar-icon ${isUnderline && 'active'}`}  onClick={toggleUnderline}>
                                            <FormatUnderlinedOutlinedIcon/>
                                        </div>
                                        <div className={`toolbar-icon ${isItalics && 'active'}`}  onClick={toggleItalics}>
                                            <FormatItalicOutlinedIcon/>
                                        </div>
                                        <div className={`toolbar-icon ${showTextColors && 'active'}`} onClick={() => setShowTextColors(prev => !prev)}>
                                            <FormatColorTextOutlinedIcon/>
                                        </div>
                                        {showTextColors && 
                                            <div className="toolbar sub color">
                                                {hexCodes.map(hex => 
                                                    <div className="circle" 
                                                        key={hex} 
                                                        style={{backgroundColor: hex, 
                                                                outline: hex === '#ffffff' ? '0.5px solid lightgray' : ''
                                                        }}
                                                        onClick={() => {
                                                            handleTextFill(hex);
                                                        }}
                                                    />
                                                )}
                                                <div className="edit-color">
                                                    <input className="color-input" 
                                                        id='color-input' 
                                                        type="color"
                                                        value={textFill}
                                                        onChange={e => {
                                                            setTextFill(e.target.value)
                                                            handleTextFill(e.target.value);
                                                        }}
                                                        onClick={e => {
                                                            setTextFill(e.target.value)
                                                            handleTextFill(e.target.value);
                                                        }}
                                                    />
                                                    <label htmlFor="color-input">
                                                        <ModeEditOutlinedIcon/>
                                                    </label>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                                <Tooltip title='Background color'>
                                <div className={`toolbar-icon ${showBackgroundOptions && 'active'}`} 
                                    onClick={() => {
                                        setShowBackgroundOptions(prev => !prev);
                                        setShowSizeOptions(false);
                                        setShowTextOptions(false);
                                    }}>
                                    <ColorLensRoundedIcon/>
                                </div>
                                </Tooltip>
                                {showBackgroundOptions && 
                                            <div className="toolbar sub color">
                                                {hexCodes.map(hex => 
                                                    <div className="circle" 
                                                        key={hex} 
                                                        style={{backgroundColor: hex, 
                                                                outline: hex === '#ffffff' ? '0.5px solid lightgray' : ''
                                                        }}
                                                        onClick={() => {
                                                            handleBgColor(hex);
                                                        }}
                                                    />
                                                )}
                                                <div className="edit-color">
                                                    <input className="color-input" 
                                                        id='color-input' 
                                                        type="color"
                                                        value={backgroundColor}
                                                        onChange={e => {
                                                            setBackgroundColor(e.target.value)
                                                            handleBgColor(e.target.value);
                                                        }}
                                                        onClick={e => {
                                                            setBackgroundColor(e.target.value)
                                                            handleBgColor(e.target.value);
                                                        }}
                                                    />
                                                    <label htmlFor="color-input">
                                                        <ModeEditOutlinedIcon/>
                                                    </label>
                                                </div>
                                            </div>
                                        }
                                <Tooltip title='Canvas size'>
                                <div className={`toolbar-icon ${showSizeOptions && 'active'}`} 
                                    onClick={() => {
                                        setShowSizeOptions(prev => !prev);
                                        setShowBackgroundOptions(false);
                                        setShowTextOptions(false);
                                    }}>
                                    <CropPortraitRoundedIcon/>
                                </div>
                                </Tooltip>
                                {showSizeOptions && 
                                    <div className="toolbar sub">
                                        <div className={`toolbar-icon sub ${sizeOption === 'collection' && 'active'}`}
                                            onClick={() => {
                                                setSizeOption('collection');
                                                handleCanvasSize('collection');
                                            }}>
                                            <CropDinIcon/>
                                            <p>Collection</p>
                                        </div>
                                        <div className={`toolbar-icon sub ${sizeOption === 'outfit' && 'active'}`}
                                            onClick={() => {
                                                        setSizeOption('outfit');
                                                        handleCanvasSize('outfit');
                                                    }}>
                                            <CropPortraitRoundedIcon/>
                                            <p>Outfit</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                            <div className="canvas-wrap"
                                ref={fabricRef}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => handleDrop(e)}>
                                <canvas id="canvas" ref={canvasRef} width={400 } height={600 }/>
                        {menu.visible &&
                            <ul className="context-menu" style={{top: menu.y, left: menu.x, position: 'absolute'}}>
                                <li onClick={() => {canvas.bringObjectToFront(menu.target)}}>
                                    <KeyboardDoubleArrowUpIcon/>
                                    <p>Bring to front</p>
                                </li>
                                <li onClick={() => {canvas.bringObjectForward(menu.target)}}>
                                    <KeyboardArrowUpIcon/>
                                    <p>Bring forward</p>
                                </li>
                                <li onClick={() => {canvas.sendObjectBackwards(menu.target)}}>
                                    <KeyboardArrowDownIcon/>
                                    <p>Send backward</p>
                                </li>
                                <li onClick={() => {canvas.sendObjectToBack(menu.target)}}>
                                    <KeyboardDoubleArrowDownIcon/>
                                    <p>Send to back</p>
                                </li>
                            </ul> 
                        }
                        </div>
                        <div className="button-wrapper">
                            <button className="sub-btn bold" onClick={() => handlePost()} >Next</button>
                            {/* <button className="sub-btn" onClick={handleSave}>Save</button> */}
                        </div>
                    </div>
                    <div className="create-sidebar">
                        <div className="basic-nav sub">
                            <p onClick={() => handleSwitchTab('closet')} style={{color: tab === 'closet' ? 'black' : 'grey'}}>CLOSET</p>
                            <p onClick={() => handleSwitchTab('wishlist')} style={{color: tab === 'wishlist' ? 'black' : 'grey'}}>WISHLIST</p>
                            <p onClick={() => handleSwitchTab('database')} style={{color: tab === 'database' ? 'black' : 'grey'}}>DATABASE</p>
                        </div>
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
                        <div className="items" ref={scrollRef}>
                            {(isLoading || isFetchingNextPage) ? (
                                <Bouncy
                                    size="45"
                                    speed="1.75"
                                    color="#6B799F"
                                    />
                            ) : items.length > 0 ? (
                                items.map(item => 
                                    <div className="item-img-wrapper" 
                                        key={item.itemRef?._id || item._id}
                                        draggable
                                        onDragStart={e => handleDragStart(e, item)}
                                        onClick={() => addImage(item)}>
                                        <img 
                                            loading='lazy'
                                            src={item.itemRef?.imageURL || item.imageURL}
                                            alt={item.name}
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="empty-closet">
                                    <p>No items found :/ ...</p>
                                </div>
                            )}
                            {hasNextPage && 
                                <div ref={sentinelRef}/>
                            }
                        </div>

                        <Filter className={`popup-container filter ${showFilter ? 'open' : ''} create`} 
                                setShowFilter={setShowFilter}
                                tags={tags}
                                setTags={setTags}
                                showTags={tab === 'database' ? false : true}
                                colors={colors}
                                setColors={setColors}
                                categs={categs}
                                setCategs={setCategs}
                                style={style}
                                setStyle={setStyle}
                                onApply={onApply}
                        />
                    </div>

                </div>
        </div>
    )
}

export default Create