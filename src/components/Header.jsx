import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-header">
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
                            <li className="nav-item">
                                <Link className="nav-link fs-5" to="/addsurvey">Thực hiện khảo sát</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fs-5" to="/SurveyList">Xem Khảo sát</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header; 