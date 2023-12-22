import React from 'react';
import logo from './logo.svg';
import './App.css';
import UserProfile from './components/userProfile';
function App() {

  const profileData = {
    name: 'John Doe',
    title: 'Software Engineer',
    id: 123,
  };
  
  return (
    <div className="App">
       {/* Other components or content */}
       <UserProfile profile={profileData} />
    </div>
  );
}

export default App;
