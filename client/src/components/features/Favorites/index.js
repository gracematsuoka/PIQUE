import './index.scss';
import Posts from '../../reusable/Posts';

const Favorites = () => {

    return (
        <div className="favorites">
            <div className="nav-content-wrapper">
                <Posts
                    mode='liked'
                />
            </div>
        </div>
    )
}

export default Favorites;