import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import './MainLayout.css';
import Chatbot from './Chatbot';

const MainLayout = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="main-layout">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <h3>NGO Dashboard</h3>
                </div>
                <ul className="sidebar-menu">
                    <li><NavLink to="/">Dashboard</NavLink></li>
                    <li><NavLink to="/manage-students">Manage Students</NavLink></li>
                    <li><NavLink to="/attendance">Attendance</NavLink></li>
                    <li><NavLink to="/student-qrcode">QR Codes</NavLink></li>
                    <li><NavLink to="/test-scores">Test Scores</NavLink></li>
                    <li><NavLink to="/volunteers">Volunteers</NavLink></li>
                </ul>
                <div className="sidebar-footer">
                    {currentUser && <p className="user-email">{currentUser.email}</p>}
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </nav>
            <main className="content">
                {children}
            </main>
            <Chatbot />
        </div>
    );
};

export default MainLayout; 