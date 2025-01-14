import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful login
import Cookies from 'js-cookie';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // To redirect after login

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Make the POST request to the server's /login route
      const response = await axios.post('http://localhost:3001/login', {
        email,
        password,
      },{
        withCredentials: true, 
      }

      
    );
    console.log("Request headers:", response.config.headers);
      
          // Handle successful login
          if (response.status === 200) {
            Cookies.set('authToken', response.data.token, { expires: 1 }); // Save the accessToken (e.g., valid for 1 day)
            Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 }); // Save the refreshToken (e.g., valid for 7 days)
            console.log('Response Headers:', response);
            console.log('Cookies:', document.cookie);
            console.log('Response Data:', response.data); // Debugging
            // Redirect the user to the URL specified in the response (if any)
            const redirectUrl = response.data.redirectUrl || '/';  // Default to home if no redirect is provided
            console.log('Redirecting to:', redirectUrl);
          
          navigate(redirectUrl);
        } else {
          throw new Error('Login failed');
        }
      } catch (error: any) {
        // Handle errors (e.g., invalid credentials)
        setError(error.response?.data?.message || 'An error occurred');
        console.error("Login error:", error);
  console.error("Error response:", error.response);
  console.error("Error response headers:", error.response?.headers);
  console.error("Error response data:", error.response?.data);
  setError(error.response?.data?.message || 'An error occurred');
      }
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
        </div>
      </div>
    );
  };
  
  export default LoginPage;