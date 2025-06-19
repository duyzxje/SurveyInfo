import React from 'react';

function Footer() {
    return (
        <footer className="bg-dark text-white mt-auto py-3">
            <div className="container">
                <p className="mb-1">© {new Date().getFullYear()} CEP</p>
                <p className="mb-0">Địa chỉ: Q.1, TP.HCM</p>
            </div>
        </footer>
    );
}

export default Footer; 