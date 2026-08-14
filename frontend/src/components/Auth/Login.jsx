import React, { useState, useContext } from 'react';
import API from '../../axios';
import { useNavigate, Link } from 'react-router-dom';
import AppContext from '../../Context/Context';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loginType, setLoginType] = useState('user');
    const navigate = useNavigate();
    const { setUser } = useContext(AppContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await API.post('/auth/login', {
                email,
                password,
            });
            
            const { token, email: userEmail, name, role } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: userEmail, name, role }));
            
            if (setUser) {
                setUser({
                    email: userEmail,
                    name: name,
                    role: role
                });
            }
            
            if (role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
            
        } catch (err) {
            console.error('Login error:', err);
            setError('INVALID EMAIL OR PASSWORD');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            navigate('/');
        }
    };

    return (
        <div className="auth-container auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-card auth-modal-card">
                <button 
                    className="close-button" 
                    onClick={() => navigate('/')}
                    title="Close"
                >
                    X
                </button>
                <h2 className="auth-title">ACCOUNT LOGIN</h2>
                
                <div className="login-type-tabs">
                    <button 
                        className={`tab ${loginType === 'user' ? 'active' : ''}`}
                        onClick={() => setLoginType('user')}
                    >
                        CUSTOMER LOGIN
                    </button>
                    <button 
                        className={`tab ${loginType === 'admin' ? 'active' : ''}`}
                        onClick={() => setLoginType('admin')}
                    >
                        ADMIN LOGIN
                    </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="emailInput">EMAIL ADDRESS</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ENTER EMAIL ADDRESS"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="passwordInput">PASSWORD</label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="passwordInput"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ENTER PASSWORD"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="auth-button">
                        {loginType === 'admin' ? 'ADMIN LOGIN' : 'CUSTOMER LOGIN'}
                    </button>
                </form>

                <p className="auth-link-text">
                    DON'T HAVE AN ACCOUNT? <Link to="/register">REGISTER HERE</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;