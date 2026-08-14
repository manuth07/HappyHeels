import React, { useState } from 'react';
import API from '../../axios'; // Use the configured axios instance
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Import custom CSS for Auth components

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // Basic validations
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
            // Log the request payload
            console.log('Register Request Payload:', { name, email, password, address, phone });
            await API.post('/auth/register', {
                name,
                email,
                password,
                address,
                phone,
            });
            console.log('Registration successful!');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <div className="auth-card auth-modal-card register-card">
                <button 
                    className="close-button" 
                    onClick={() => navigate('/')}
                    title="Close and return to home"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
                <h2 className="auth-title">Register</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nameInput">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nameInput"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="emailInput">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                required
                            />
                            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                                <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                            </span>
                        </div>
                    </div>
                    <div className="form-group password-group">
                        <label htmlFor="confirmPasswordInput">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="confirmPasswordInput"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="addressInput">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="addressInput"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneInput">Phone</label>
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
                            required
                        />
                        <small className="text-muted">Enter 10 digit number</small>
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>
                <p className="auth-link-text">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
