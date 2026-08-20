import React, { useState } from 'react';
import API from '../../axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const phoneDigitsOnly = phone.replace(/\D/g, '');
        if (phoneDigitsOnly.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await API.post('/auth/register', {
                name,
                email,
                password,
                address,
                phone,
            });
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            navigate('/');
        }
    };

    return (
        <div className="auth-container auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-card auth-modal-card register-card">
                <button 
                    className="close-button" 
                    onClick={() => navigate('/')}
                    title="Close"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
                <h2 className="auth-title">Create Account</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="nameInput">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nameInput"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="emailInput">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="passwordInput">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="passwordInput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="confirmPasswordInput">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="confirmPasswordInput"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="addressInput">Shipping Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="addressInput"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Complete shipping address"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="phoneInput">Phone Number (10 Digits)</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phoneInput"
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(digits);
                            }}
                            placeholder="07XXXXXXXX"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">Create Account</button>
                </form>
                <p className="auth-link-text">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
