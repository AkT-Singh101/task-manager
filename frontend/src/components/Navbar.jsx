import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">Team Task Manager</Link>
        <div className="navbar-links">
          <Link to="/">Dashboard</Link>
          {user && (
            <div className="navbar-user">
              <span>{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
