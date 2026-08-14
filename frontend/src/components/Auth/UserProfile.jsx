import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../axios';
import AppContext from '../../Context/Context';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Pre-fill form with current user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      address: user.address || '',
      phone: user.phone || ''
    });
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await API.put('/auth/me', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile update response:', response.data);

      // Update local storage and context
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (setUser) {
        setUser(updatedUser);
      }

      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error('Profile update error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button 
          className="close-button" 
          onClick={() => navigate('/')}
          title="Close and return to home"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          <h2 className="profile-title">Update Profile</h2>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className="bi bi-person me-2"></i>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="bi bi-envelope me-2"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group password-group">
              <label htmlFor="password" className="form-label">
                <i className="bi bi-lock me-2"></i>
                New Password (leave blank to keep current)
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
                <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                  <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                </span>
              </div>
            </div>

            <div className="form-group password-group">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="bi bi-lock-fill me-2"></i>
                Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
                <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
                  <i className={showConfirmPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                </span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                <i className="bi bi-geo-alt me-2"></i>
                Address
              </label>
              <textarea
                id="address"
                name="address"
                className="form-control"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                <i className="bi bi-telephone me-2"></i>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary cancel-btn"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary update-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-hourglass-split me-2"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
