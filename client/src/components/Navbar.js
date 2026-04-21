import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/',              label: 'Home' },
    { path: '/map',           label: 'Map' },
    { path: '/complaints',    label: 'All Complaints' },
    { path: '/my-complaints', label: 'My Complaints' },
    { path: '/leaderboard',   label: 'Leaderboard' },
    { path: '/report',        label: 'Report Issue' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>👁️</span>
          <span style={styles.logoText}>CivicEye</span>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={isActive(link.path) ? styles.linkActive : styles.link}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user ? (
            <>
              <Link to="/profile" style={styles.profileBtn}>
                👤 {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" style={styles.mobileLink}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: '#ffffff',
    borderBottom: '2px solid #f97316',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f97316'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  link: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1c1917',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  linkActive: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#f97316',
    textDecoration: 'none',
    fontWeight: '600',
    background: '#fff7ed'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  profileBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1c1917',
    textDecoration: 'none',
    fontWeight: '500',
    background: '#f5f5f4'
  },
  logoutBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    background: '#f97316',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer'
  },
  loginBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#f97316',
    textDecoration: 'none',
    fontWeight: '500'
  },
  registerBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ffffff',
    background: '#f97316',
    textDecoration: 'none',
    fontWeight: '500'
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#f97316'
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    padding: '16px 20px',
    borderTop: '1px solid #f5f5f4'
  },
  mobileLink: {
    padding: '12px 0',
    fontSize: '15px',
    color: '#1c1917',
    textDecoration: 'none',
    borderBottom: '1px solid #f5f5f4',
    fontWeight: '500'
  },
  mobileLogout: {
    padding: '12px 0',
    fontSize: '15px',
    color: '#f97316',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default Navbar;