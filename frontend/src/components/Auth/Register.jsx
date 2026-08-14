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
            setError('PHONE NUMBER MUST BE EXACTLY 10 DIGITS');
            return;
        }
        if (password !== confirmPassword) {
            setError('PASSWORDS DO NOT MATCH');
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
            setError(err.response?.data?.message || 'REGISTRATION FAILED. PLEASE TRY AGAIN.');
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
                    X
                </button>
                <h2 className="auth-title">CREATE ACCOUNT</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="nameInput">FULL NAME</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nameInput"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ENTER FULL NAME"
                            required
                        />
                    </div>
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
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="confirmPasswordInput">CONFIRM PASSWORD</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="confirmPasswordInput"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="RE-ENTER PASSWORD"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="addressInput">SHIPPING ADDRESS</label>
                        <input
                            type="text"
                            className="form-control"
                            id="addressInput"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="ENTER COMPLETE ADDRESS"
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="phoneInput">PHONE NUMBER (10 DIGITS)</label>
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
                    <button type="submit" className="auth-button">REGISTER ACCOUNT</button>
                </form>
                <p className="auth-link-text">
                    ALREADY HAVE AN ACCOUNT? <Link to="/login">LOGIN HERE</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
