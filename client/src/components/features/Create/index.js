import NavBar from "../NavBar";
import TopBar from "../TopBar";
import './index.scss';
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg';
import SearchBar from "../../reusable/SearchBar";
import Filter from "../../popups/Filter";
import { useRef, useState, useEffect } from "react";
import {Canvas, FabricImage, FabricText, Textbox} from "fabric";
import { useCloset } from "../../../contexts/ClosetContext";
// toolbar
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsOutlined';
import UndoRoundedIcon from '@mui/icons-material/UndoOutlined';
import RedoRoundedIcon from '@mui/icons-material/RedoOutlined';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensOutlined';
import CropPortraitRoundedIcon from '@mui/icons-material/CropPortraitOutlined';

const Create = () => {
    const {closetItems} = useCloset();
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        if(canvasRef.current) {
            const fabricCanvas = new Canvas(canvasRef.current, {
                width: 400,
                height: 600,
                selection: true
            })
            fabricCanvas.backgroundColor='#ffffff'
            fabricCanvas.renderAll();

            setCanvas(fabricCanvas);

            return () => {
                fabricCanvas.dispose();
            }
        }

        const handleDelete = (e) => {
            console.log('fired')
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const activeObject = canvas.getActiveObject();
                console.log('active:', activeObject)
                if (activeObject) {
                    canvas.remove(activeObject);
                }
            }
        }

        canvas.on('key:down', handleDelete);
    
        return () => {
            canvas.off('key:donw', handleDelete)
        }
    }, [])

    useEffect(() => {
        const handleKeyPress = (e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              canvas.remove(activeObject);
            }
          }
        //   if (e.ctrlKey && e.key === 'z') {
        //     // Undo functionality
        //   }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
      }, [canvas]);

    const handleDragStart = (e, item) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(item));

        e.dataTransfer.setDragImage(e.target, e.target.width / 2, e.target.height / 2);
    }

    const handleDrop = async (e) => {
        e.preventDefault();
        
        const data = JSON.parse(e.dataTransfer.getData('application/json'));

        const { x, y } = canvas.getPointer(e.nativeEvent);
        console.log({x, y})

        console.log('coord:', {x, y})

        const img = await FabricImage.fromURL(data.itemRef?.imageURL.replace('/public', '/300'),
            {crossOrigin: 'anonymous'},
            {
                left: x,
                top: y,
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: true,
                dbId: data.id
            }
        )
        canvas.add(img)
    }

    const addText = async () => {
        const text = new Textbox('Text',{
            left: 50,
            top: 50,
            fontFamily: 'Publica Play Bold',
            editable: true
        })

        canvas.add(text);
    }

    return (
        <div className="create">
            <TopBar/>
                <div className="nav-content">
                    <NavBar/>
                    <div className="nav-content-wrapper">
                        <div className="basic-nav create">
                            <p>CREATE</p>
                            <p>DRAFTS</p>
                        </div>
                        <hr/>
                        <div className="create-wrapper">
                            <div className="create-board">
                                <div className="create-top">
                                    <div className="input-wrapper">
                                        <input type='text' placeholder="Title goes here..."/>
                                    </div>
                                    <div className="toolbar">
                                        <div className="toolbar-icon">
                                            <UndoRoundedIcon/>
                                        </div>
                                        <div className="toolbar-icon">
                                            <RedoRoundedIcon/>
                                        </div>
                                        <hr/>
                                        <div className="toolbar-icon" onClick={addText}>
                                            <TextFieldsRoundedIcon/>
                                        </div>
                                        <div className="toolbar-icon">
                                            <ColorLensRoundedIcon/>
                                        </div>
                                        <div className="toolbar-icon">
                                            <CropPortraitRoundedIcon/>
                                        </div>
                                    </div>
                                </div>
                                {isEmpty && 
                                    <div className='empty-board-message'>
                                        <ShirtIcon className='clothes-upload'/>
                                        <p>Start dragging items here</p>
                                    </div>
                                }
                                {!isEmpty &&
                                    <div className="canvas-wrap"
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => handleDrop(e)}
                                    >
                                        <canvas id="canvas" ref={canvasRef}/>
                                    </div>
                                }
                                <div className="button-wrapper">
                                    <button className="sub-btn post">POST</button>
                                    <button className="sub-btn">SAVE</button>
                                </div>
                            </div>
                            <div className="create-sidebar">
                                <div className="basic-nav sub">
                                    <p>CLOSET</p>
                                    <p>DATABASE</p>
                                    <p>UPLOAD</p>
                                </div>
                                <div className="search-filter">
                                    <SearchBar/>
                                    {/* <Filter /> */}
                                </div>
                                <div className="image-database">
                                        {closetItems.map(item => 
                                            <div className="item-img-wrapper" 
                                                key={item._id}
                                                draggable
                                                onDragStart={e => handleDragStart(e, item)}
                                                >
                                                <img 
                                                    src={item.itemRef?.imageURL.replace('/public', '/300')}
                                                    alt={item.name}
                                                />
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Create