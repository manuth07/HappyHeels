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
    const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
    const navigate = useNavigate();
    const { refreshData, setUser } = useContext(AppContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log('Login as:', loginType);
            const response = await API.post('/auth/login', {
                email,
                password,
            });
            
            console.log('Login response:', response.data);
            
            const { token, email: userEmail, name, role } = response.data;
            
            console.log('Storing token:', token.substring(0, 20) + '...');
            console.log('Storing user:', { email: userEmail, name, role });
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: userEmail, name, role }));
            
            if (setUser) {
                setUser({
                    email: userEmail,
                    name: name,
                    role: role
                });
            }
            
            console.log('Login successful! Role:', role);
            
            // Redirect based on role
            if (role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
            
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password');
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
                    title="Close and return to home"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
                <h2 className="auth-title">Login</h2>
                
                {/* ✅ Role Selection Tabs */}
                <div className="login-type-tabs">
                    <button 
                        className={`tab ${loginType === 'user' ? 'active' : ''}`}
                        onClick={() => setLoginType('user')}
                    >
                        👟 Customer Login
                    </button>
                    <button 
                        className={`tab ${loginType === 'admin' ? 'active' : ''}`}
                        onClick={() => setLoginType('admin')}
                    >
                        ⚙️ Admin Login
                    </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="emailInput">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <div className="form-group password-group">
                        <label htmlFor="passwordInput">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="passwordInput"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                                <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="auth-button">
                        {loginType === 'admin' ? 'Admin Login' : 'Customer Login'}
                    </button>
                </form>


                <p className="auth-link-text">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;