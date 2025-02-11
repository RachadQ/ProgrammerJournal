import React from 'react';
import logo from './logo.svg';
import './App.css';
import UserProfile from './components/userProfile';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/Login'
import SignUp from './components/SignUp';
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import BaseLayout from './components/Default/BaseLayout';
function App() {

  const profileData = {
    name: 'John Doe',
    title: 'Software Engineer',
    id: 123,
  };
  
  return (
    <div className="App">
      
      <BaseLayout>
        <Routes>
          {/*<UserProfile profile={profileData} />*/}
          <Route path="/"  element={<HomePage/>} />
          <Route path="/user/:username" element={<UserProfile/>} />
          {/* New route for login page */}
          <Route path="/login" element={<LoginPage />} />
           {/* New route for SignUp page */}
          <Route path="/signUp" element={<SignUp/>} />
          {/* New route for verifying email page */}
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="create-account" element={<SignUp/>}/>
        </Routes>
        </BaseLayout>
      
    </div>
  );
}

export default App;
