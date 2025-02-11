import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful login
import Cookies from 'js-cookie';
import {useAuth} from "./Default/AuthProvider"


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();  // Access the login function from AuthContext
  const navigate = useNavigate();  // Initialize navigate function


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    await login(email, password); // Call the login function from context
  };
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
  
          {/* Show error message if login fails */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
  
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-2"
                required
              />
            </div>
  
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-semibold">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-2"
                required
              />
            </div>
  
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded mt-4"
            >
              Login
            </button>
          </form>
          {/* Forgot Password Link */}
        <p className="mt-4 text-sm text-center">
          Forgot your password?{' '}
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-blue-500 hover:underline"
          >
            Reset it here
          </button>
        </p>

        {/*Create Acount Button */}
        <p className="mt-4 text-sm text-center">
        Don't have an Account?{' '}
        <button
          onClick={() => navigate('/create-account')}
          className="text-blue-500 hover:unerline"
          >
            Create one here
          
        </button>

        </p>
        </div>
      </div>
    );
  };
  
  export default LoginPage;