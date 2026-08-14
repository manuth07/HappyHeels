import React, { useState, useEffect, useContext } from 'react';
import API from '../../axios';
import { Link } from 'react-router-dom';
import AppContext from '../../Context/Context';
import './Reviews.css';

const Reviews = ({ productId }) => {
  const { user } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    comment: '',
    rating: 5,
    productId: productId
  });
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/reviews/product/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit a review');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await API.post('/reviews', newReview, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Reset form and refresh reviews
      setNewReview({
        comment: '',
        rating: 5,
        productId: productId
      });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 401) {
        setError('Please login to submit a review');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleEditClick = (review) => {
    setEditingReview({
      id: review.id,
      comment: review.comment,
      rating: review.rating
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await API.put(`/reviews/${editingReview.id}`, {
        comment: editingReview.comment,
        rating: editingReview.rating,
        productId: productId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            style={{
              color: star <= rating ? '#ffc107' : '#e4e5e9',
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '1.2rem',
              marginRight: '2px'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-section" id="reviews">
      <div className="reviews-header">
        <h3 className="reviews-title">
          <i className="bi bi-star-fill me-2"></i>
          Customer Reviews
          <span className="reviews-count">({reviews.length})</span>
        </h3>
      </div>
      
      {/* Add Review Section */}
      <div className="add-review-section">
        {user ? (
          <div className="add-review-form">
            <h5 className="form-title">
              <i className="bi bi-pencil-square me-2"></i>
              Write a Review
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="rating-section">
                <label className="rating-label">Your Rating</label>
                <div className="rating-input">
                  {renderStars(newReview.rating, true, handleRatingChange)}
                  <span className="rating-text">
                    {newReview.rating === 1 ? 'Poor' : 
                     newReview.rating === 2 ? 'Fair' : 
                     newReview.rating === 3 ? 'Good' : 
                     newReview.rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                </div>
              </div>
              
              <div className="comment-section">
                <label className="comment-label">Your Review</label>
                <textarea
                  className="review-textarea"
                  rows="4"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this product. What did you like or dislike about it?"
                  required
                />
              </div>
              
              {error && (
                <div className="review-error">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="bi bi-hourglass-split me-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-prompt">
            <div className="login-prompt-content">
              <i className="bi bi-lock-fill login-icon"></i>
              <h5 className="login-prompt-title">Want to share your experience?</h5>
              <p className="login-prompt-text">
                Please <Link to="/login" className="login-link">login</Link> or <Link to="/register" className="register-link">create an account</Link> to write a review and help other customers make informed decisions.
              </p>
              <div className="login-prompt-buttons">
                <Link to="/login" className="btn btn-primary login-btn">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-primary register-btn">
                  <i className="bi bi-person-plus me-2"></i>
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <i className="bi bi-chat-square-text no-reviews-icon"></i>
            <h5 className="no-reviews-title">No reviews yet</h5>
            <p className="no-reviews-text">
              Be the first to share your experience with this product!
            </p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                {editingReview && editingReview.id === review.id ? (
                  // Edit Mode
                  <form onSubmit={handleUpdateReview} className="edit-review-form">
                    <div className="rating-section">
                      <label className="rating-label">Your Rating</label>
                      <div className="rating-input">
                        {renderStars(editingReview.rating, true, (rating) => setEditingReview({...editingReview, rating}))}
                        <span className="rating-text">
                          {editingReview.rating === 1 ? 'Poor' : 
                           editingReview.rating === 2 ? 'Fair' : 
                           editingReview.rating === 3 ? 'Good' : 
                           editingReview.rating === 4 ? 'Very Good' : 'Excellent'}
                        </span>
                      </div>
                    </div>
                    <textarea
                      className="review-textarea"
                      rows="4"
                      value={editingReview.comment}
                      onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                      required
                    />
                    <div className="edit-review-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                        <i className="bi bi-check-circle me-1"></i>
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="review-card-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <i className="bi bi-person-circle"></i>
                        </div>
                        <div className="reviewer-details">
                          <h6 className="reviewer-name">{review.userName}</h6>
                          <p className="reviewer-email">{review.userEmail}</p>
                        </div>
                      </div>
                      <div className="review-actions-container">
                        <div className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {user && user.email === review.userEmail && (
                          <div className="review-actions">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditClick(review)}
                              title="Edit review"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteReview(review.id)}
                              title="Delete review"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;

