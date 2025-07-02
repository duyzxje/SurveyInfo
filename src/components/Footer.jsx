import React from 'react';

import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-footer text-white mt-auto py-3">
            <div className="container">
                <div className="d-flex justify-content-between">
                    <p className="">© {new Date().getFullYear()} CEP</p>
                    <p className="mr-auto">Địa chỉ: Q.1, TP.HCM</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 