import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../contexts/AuthContext";
import "./Login_Page.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Login successful!");
        await login(username); // Update auth context
        setTimeout(() => navigate("/"), 1000); // Navigate after a short delay
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      console.error("Error during login:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group1">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group1">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Show Password Toggle */}
          <div className="show-password">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show password</label>
          </div>

          {/* Submit */}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
