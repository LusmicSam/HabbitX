import { LayoutDashboard, CheckSquare, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const { signOut } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <span style={{ fontSize: '2rem' }}>🚀</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <LayoutDashboard size={24} />
                    <span className="tooltip">Dashboard</span>
                </NavLink>

                <NavLink to="/habits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CheckSquare size={24} />
                    <span className="tooltip">Habits</span>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={24} />
                    <span className="tooltip">Settings</span>
                </NavLink>
            </nav>

            <button onClick={signOut} className="nav-item logout-btn">
                <LogOut size={24} />
                <span className="tooltip">Sign Out</span>
            </button>
        </div>
    );
}

export default Sidebar;
