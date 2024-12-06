import React from 'react';
import logo from './logo.svg';
import './App.css';
import UserProfile from './components/userProfile';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import HomePage from './components/HomePage';
function App() {

  const profileData = {
    name: 'John Doe',
    title: 'Software Engineer',
    id: 123,
  };
  
  return (
    <div className="App">
      <Router>
        <Routes>
          {/*<UserProfile profile={profileData} />*/}
          <Route path="/"  element={<HomePage/>} />
          <Route path="/about" element={<UserProfile profile={profileData}/>} />
        </Routes>
       </Router>
    </div>
  );
}

export default App;
