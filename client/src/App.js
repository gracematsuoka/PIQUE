import Home from './components/home-content/Home';
import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/home-content/Auth';
import Explore from './components/features/Explore';
import AccountSetup from './components/home-content/AccountSetup';
import PrivateRoute from './PrivateRoute';
import Profile from './components/features/Profile';
import ForgotPassword from './components/home-content/ForgotPassword';
import { useAuth } from './components/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

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
          <Route
            path="/"
            element={
              currentUser ? <Navigate to="/explore" /> : <Home/> 
            }
          />
          <Route path='/log-in' element={<Auth mode="login"/>}/>
          <Route path='/sign-up' element={<Auth mode="signup"/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route
            path="/account-setup"
            element={
              <PrivateRoute>
                <AccountSetup />
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
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
