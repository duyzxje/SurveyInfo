import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Logout from './Logout';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const [hovering, setHovering] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const [isFixed, setIsFixed] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const dropdownRef = useRef(null);
    const headerRef = useRef(null);

    // Handle click outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle fixed header on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (!headerRef.current) return;

            const headerHeight = headerRef.current.offsetHeight;
            const scrollPosition = window.scrollY;

            if (scrollPosition >= headerHeight) {
                setIsFixed(true);
                // Set CSS variable for the header height to maintain proper spacing
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
                document.body.classList.add('fixed-header-active');
            } else {
                setIsFixed(false);
                document.body.classList.remove('fixed-header-active');
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Initial header height calculation
        if (headerRef.current) {
            const headerHeight = headerRef.current.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Handle dropdown toggle
    const handleDropdownToggle = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <header ref={headerRef} className={isFixed ? 'fixed-header' : ''}>
            <nav className="navbar navbar-expand-lg bg-header">
                <div className="container">
                    <div className="">
                        <Link className="navbar-brand d-flex align-items-center" to="/">
                            <img src="https://cep.org.vn/wp-content/uploads/2022/09/lo.svg" alt="Logo" className="img-fluid" style={{ maxWidth: 400, height: 'auto' }} />
                        </Link>
                    </div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#cepNav" aria-controls="cepNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="cepNav">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li
                                className="nav-item dropdown position-relative "

                                ref={dropdownRef}
                                onMouseEnter={() => setHovering(true)}
                                onMouseLeave={() => {
                                    setHovering(false);
                                    if (!isOpen) {
                                        setActiveItem(null);
                                    }
                                }}
                            >
                                <Link
                                    className="nav-link fs-4 text-decoration-none text-white d-inline-block"
                                    to="#"
                                    id="navbarDropdown"
                                    role="button"

                                    onClick={handleDropdownToggle}
                                    aria-expanded={isOpen || hovering}
                                >
                                    Khảo sát
                                </Link>
                                <ul
                                    className={`dropdown-menu fs-5 shadow ${(isOpen || hovering) ? 'show' : ''}`}
                                    aria-labelledby="navbarDropdown"
                                    style={{
                                        minWidth: '220px',
                                        padding: '0.5rem 0',
                                        position: 'absolute',
                                        right: '0',
                                        left: 'auto',
                                        transform: 'none'
                                    }}
                                >
                                    <li>
                                        <Link
                                            className={`dropdown-item fs-5 py-2 ${activeItem === 'add' ? 'active bg-primary text-white' : ''}`}
                                            to="/addsurvey"
                                            onMouseEnter={() => setActiveItem('add')}
                                            onMouseLeave={() => !isOpen && setActiveItem(null)}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <i className="bi bi-clipboard-plus me-2"></i>
                                            Thực hiện khảo sát
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className={`dropdown-item fs-5 py-2 ${activeItem === 'list' ? 'active bg-primary text-white' : ''}`}
                                            to="/SurveyList"
                                            onMouseEnter={() => setActiveItem('list')}
                                            onMouseLeave={() => !isOpen && setActiveItem(null)}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <i className="bi bi-list-ul me-2"></i>
                                            Xem danh sách khảo sát
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            {isAuthenticated && (
                                <li className="nav-item ms-3 d-flex align-items-center">
                                    <div className="d-flex align-items-center">
                                        <span className="text-white me-3">
                                            <i className="bi bi-person-circle me-1"></i>
                                            {user?.username || 'Admin'}
                                        </span>
                                        <Logout />
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header >
    );
}

export default Header; 