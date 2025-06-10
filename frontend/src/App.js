import Home from './components/home-content/Home';
import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/home-content/Auth';

function App() {
  return (
    <div className="App">
      <Router>
        <div className='scroll-content'>
          <section id='browse'></section>
        </div>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/log-in' element={<Auth mode="login"/>}/>
          <Route path='/sign-up' element={<Auth mode="signup"/>}/>
        </Routes>

      </Router>
    </div>
  );
}

export default App;
