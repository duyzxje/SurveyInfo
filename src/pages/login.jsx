import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingOverlay from "../components/loadingOverlay";
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the page user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // In a real app, this would be an API call to a backend authentication service
            // For this demo, we'll just check against hardcoded credentials
            if (username === 'admin' && password === 'admin123') {
                // Use the login function from AuthContext
                login({ username, role: 'admin' });

                // Navigate to the page user was trying to access or home page
                navigate(from, { replace: true });
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <LoadingOverlay />}
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0 rounded-lg">
                            <div className="card-header bg-primary text-white text-center">
                                <h3 className="my-3"><i className="bi bi-lock me-2"></i>Đăng nhập</h3>
                            </div>
                            <div className="card-body p-4">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label fs-5">Tên đăng nhập</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person-fill"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control fs-5"
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label fs-5">Mật khẩu</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-key-fill"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control fs-5"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg px-5"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                                    Đăng nhập
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
