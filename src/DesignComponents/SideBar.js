// src/components/Sidebar.jsx
import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { logout, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setIsExpanded(false);
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isExpanded ? '✕' : '☰'}
      </button>
      {isExpanded && (
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" exact="true" activeClassName="active" onClick={handleNavClick}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/create-bill" activeClassName="active" onClick={handleNavClick}>
                Create Bill
              </NavLink>
            </li>
            <li>
              <NavLink to="/booking" activeClassName="active" onClick={handleNavClick}>
                Create Booking
              </NavLink>
            </li>
            <li>
              <NavLink to="/view-bookings" activeClassName="active" onClick={handleNavClick}>
                Bookings
              </NavLink>
            </li>
            <li>
              <NavLink to="/view-past-orders" activeClassName="active" onClick={handleNavClick}>
                View All Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventory" activeClassName="active" onClick={handleNavClick}>
                Add Inventory
              </NavLink>
            </li>
            <li>
              <NavLink to="/inventoryManagement" activeClassName="active" onClick={handleNavClick}>
                Inventory Management
              </NavLink>
            </li>

            {/* ✅ Only show for admin */}
            {role === 'admin' && (
              <li>
                <NavLink to="/users" activeClassName="active" onClick={handleNavClick}>
                  Users
                </NavLink>
              </li>
            )}

            <li>
              <button className="logout-button" onClick={() => { handleLogout(); handleNavClick(); }}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
