import React from 'react';

import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-dark text-white mt-auto py-3">
            <div className="container">
                <div className="d-flex justify-content-between">
                    <p className="">© {new Date().getFullYear()} CEP</p>
                    <div className="d-flex align-items-center">
                        <img src="/assets/img/logo.png" alt="Logo" height="30" className="me-2" />
                    </div>
                    <p className="mr-auto">Địa chỉ: Q.1, TP.HCM</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 