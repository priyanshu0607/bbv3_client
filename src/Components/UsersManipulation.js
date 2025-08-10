import { useState } from "react";
import "./Users.css";

const UsersManipulation = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  const userData = { username: name, role, password };

  try {
    const response = await fetch("http://localhost:3000/api/users/AddUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert(`✅ User created!\nUsername: ${result.user.username}`);
      setName("");
      setRole("User");
      setPassword("");
    } else {
      alert(`❌ Error: ${result.message || "Failed to create user"}`);
    }
  } catch (error) {
    console.error("🚨 Error creating user:", error);
    alert("An error occurred while creating the user.");
  }
};



  return (
    <div className="users-container">
      <div className="users-content">
        <h1 className="users-title">Create User</h1>
        <div className="users-card">
          <form onSubmit={handleSubmit} className="users-form">
            <div className="users-form-group">
              <label>UserName</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="users-input"
              />
            </div>
            <div className="users-form-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="users-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="users-form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="users-input"
              />
            </div>
            <button type="submit" className="users-button">
              Create User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsersManipulation;
