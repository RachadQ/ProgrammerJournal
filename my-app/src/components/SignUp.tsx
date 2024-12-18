import React, { useState } from 'react';
import { SignUpForm } from '../interface/UserInterface';  // Import the User interface
//import { User } from '../interface/UserInterface';  // Import the User interface

const SignUp: React.FC = () => {
  const [userData, setUserData] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: '',
    username: '',
   
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send data to the backend for signup
    const response = await fetch('http://localhost:3001/user/signUp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    if (response.ok) {
      // Handle successful signup
      alert('User created successfully!');
    } else {
      // Handle errors
      alert(result.message || 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          value={userData.firstName || ''}
          onChange={handleChange}
          placeholder="First Name"
          className="p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="text"
          name="lastName"
          value={userData.lastName || ''}
          onChange={handleChange}
          placeholder="Last Name"
          className="p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="email"
          name="email"
          value={userData.email || ''}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="password"
          name="password"
          value={userData.password || ''}
          onChange={handleChange}
          placeholder="Password"
          className="p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="password"
          name="confirmPassword"
          value={userData.confirmPassword || ''}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="p-2 border border-gray-300 rounded w-full"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;