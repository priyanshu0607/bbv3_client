// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../contexts/AuthContext';
import './Login_Page.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        await login(username); // Fetch role from server
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error during login:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-box">
      <ToastContainer />
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group1">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group1">
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="show-password">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={togglePasswordVisibility}
            />
            <label htmlFor="showPassword">Show password</label>
          </div>
        </div>
        <div className="form-group1">
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
