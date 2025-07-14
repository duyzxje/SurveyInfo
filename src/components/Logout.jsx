import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        // First logout
        navigate('/');
        logout();
    };

    return (
        <button
            className="btn btn-outline-light"
            onClick={handleLogout}
            title="Đăng xuất"
        >
            <i className="bi bi-box-arrow-right me-1"></i>
            Đăng xuất
        </button>
    );
};

export default Logout; 