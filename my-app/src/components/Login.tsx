import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful login



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
      });
      
      // Handle successful login
      const { token } = response.data;

       // Verify the token using Axios
       const verifyTokenResponse = await axios.post('http://localhost:3001/verify-token', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (verifyTokenResponse.status === 200) {
        // Store the token in localStorage (or sessionStorage)
        localStorage.setItem('authToken', token);

        // Redirect the user to the URL specified in the token
        // Assuming the redirect URL is returned in the verifyTokenResponse
        const redirectUrl = verifyTokenResponse.data.redirectUrl;
        navigate(redirectUrl);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error: any) {
      // Handle errors (e.g., invalid credentials)
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
      </div>
    </div>
  );
};

export default LoginPage;
