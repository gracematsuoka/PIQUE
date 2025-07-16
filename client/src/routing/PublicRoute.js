import {Navigate} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
    const {firebaseUser, mongoUser, loading} = useAuth();

    if (loading || firebaseUser && mongoUser === null) return null;

    if (firebaseUser && mongoUser?.username) {
        return <Navigate to="/explore"/>;
    }

    if (firebaseUser && !mongoUser?.username) {
        return <Navigate to="/account-setup"/>
    }

    return children;
} 

export default PublicRoute;