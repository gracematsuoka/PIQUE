import {Navigate} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
    const {firebaseUser} = useAuth();

    return firebaseUser ? <Navigate to="/explore"/> : children;
} 

export default PublicRoute;