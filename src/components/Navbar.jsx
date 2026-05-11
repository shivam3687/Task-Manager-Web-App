import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, CheckSquare, Layers, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass" style={{ margin: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex items-center gap-2">
        <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '12px', color: 'white' }}>
          <CheckSquare size={24} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#333' }}>TaskFlow</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          <Home size={18} /> Dashboard
        </Link>
        <Link to="/projects" className="flex items-center gap-2" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          <Layers size={18} /> Projects
        </Link>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--card-border)' }}></div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col" style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</span>
            <span className={`badge ${user.role === 'Admin' ? 'badge-high' : 'badge-low'}`} style={{ alignSelf: 'flex-end', fontSize: '0.7rem' }}>{user.role}</span>
          </div>
          <button onClick={handleLogout} className="btn" style={{ padding: '8px', background: 'rgba(0,0,0,0.05)', color: '#555' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
