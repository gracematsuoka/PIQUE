import './index.scss';
import outfit from '../../../assets/images/home/testoutfit.jpg';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { Bouncy } from 'ldrs/react';
import AddBoard from '../../popups/AddBoard';

const Boards = () => {
    const [empty, setEmpty] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const boards = 0

    return (
        <div className="boards">
            <Tooltip title='New board'>
            <div className="add" onClick={() => setShowAddBoard(true)} >
                <AddIcon/>
            </div>
            </Tooltip>
            {showAddBoard && 
                <AddBoard 
                    setShowAddBoard={setShowAddBoard}
                />}
        {loading ? (
            <Bouncy
                size="45"
                speed="1.75"
                color="#6B799F"
                />
        ) : boards > 0 ? (
            <div className="board">
                <img src={outfit}/>
                <div className="board-title">
                    <div className="h1-wrap">
                        <h1>WINTER OUTFITS</h1>
                    </div>
                    <p>24 Saved</p>
                </div>
                <Tooltip title='Edit board'>
                <div className="edit">
                    <EditIcon/>
                </div>
                </Tooltip>
            </div>
        ) : (
            <div className='empty'>
                <p>You have no boards yet...</p>
                <div className='empty-h1'>
                    <h1>Click + to get started</h1>
                </div>
            </div>
        )}
    </div>
    )
}

export default Boards;