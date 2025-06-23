import Home from './components/home-content/Home';
import './App.scss';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/home-content/Auth';
import Explore from './components/features/Explore';
import AccountSetup from './components/home-content/AccountSetup';
import PrivateRoute from './routing/PrivateRoute';
import PublicRoute from './routing/PublicRoute';
import Profile from './components/features/Profile';
import ForgotPassword from './components/home-content/ForgotPassword';
import Closet from './components/features/Closet';
import Create from './components/features/Create';
import Style from './components/features/Style';
import Saved from './components/features/Saved';
import Settings from './components/features/Settings';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="App">
      <Router>
        <div className='scroll-content'>
          <section id='browse'></section>
        </div>
        <Routes>
          <Route path="/"
            element={
              <PublicRoute>
                <Home/>
              </PublicRoute>
            }
          />
          <Route path='/log-in' 
            element={
              <PublicRoute>
                <Auth mode="login"/>
              </PublicRoute>
            }/>
          <Route path='/sign-up' 
            element={
              <PublicRoute>
                <Auth mode="signup"/>
              </PublicRoute>
            }/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route
            path="/account-setup"
            element={
              <PrivateRoute>
                <AccountSetup mode='setup'/>
              </PrivateRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <PrivateRoute>
                <Explore />
              </PrivateRoute> 
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute> 
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/closet"
            element={
              <PrivateRoute>
                <Closet />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <Create />
              </PrivateRoute>
            }
          />
          <Route
            path="/style"
            element={
              <PrivateRoute>
                <Style />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <PrivateRoute>
                <Saved />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
