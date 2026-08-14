import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import API from '../../axios';
import AppContext from '../../Context/Context';
import { useNavigate } from 'react-router-dom';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, onOrderSuccess }) => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddress: ''
  });
  const [bankSlip, setBankSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setBankSlip(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    console.log('Checkout - Token available:', !!token);
    console.log('Checkout - User context:', user);
    console.log('Checkout - Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token || !user) {
      setError('Please login to place an order');
      return;
    }
    
    // Validate form fields
    if (!formData.customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!formData.shippingAddress.trim()) {
      setError('Please enter your shipping address');
      return;
    }
    if (!bankSlip) {
      setError('Please upload a bank slip');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        orderItems: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const formDataToSend = new FormData();
      formDataToSend.append('order', JSON.stringify(orderData));
      formDataToSend.append('bankSlip', bankSlip);
      
      console.log('Sending order data:', orderData);
      console.log('Bank slip file:', bankSlip);
      console.log('Token available:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('User context:', user);
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      
      const response = await API.post('/orders', formDataToSend);
      
      console.log('Order response:', response.data);

      setSuccess('Order placed successfully! Your order is pending payment verification.');
      
      // Reset form
      setFormData({
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        shippingAddress: ''
      });
      setBankSlip(null);
      
      // Call success callback to clear cart and close modal
      setTimeout(() => {
        onOrderSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Don't logout on order errors, just show the error message
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else {
        setError(`Failed to place order. Error: ${error.response?.status || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setError('');
    setSuccess('');
    setBankSlip(null);
    handleClose();
  };

  return (
    <div className="checkoutPopup">
      <Modal show={show} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cart-check me-2"></i>
            Checkout & Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}


          <Form id="checkout-form" onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <h5 className="mb-3">
                  <i className="bi bi-person me-2"></i>
                  Customer Information
                </h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Shipping Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your complete shipping address"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <h5 className="mb-3">
                  <i className="bi bi-credit-card me-2"></i>
                  Payment Information
                </h5>

                <div className="payment-info mb-3 p-3 bg-light rounded">
                  <h6><i className="bi bi-info-circle me-2"></i>Payment Instructions:</h6>
                  <ol className="small">
                    <li>Transfer the total amount to our bank account</li>
                    <li>Upload the bank slip as proof of payment</li>
                    <li>We will verify the payment and process your order</li>
                  </ol>
                  <p className="mb-0 small text-muted">
                    <strong>Bank Details:</strong><br/>
                    Account: HappyHeels Store<br/>
                    Bank: Commercial Bank<br/>
                    Account Number: 1234567890
                  </p>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Bank Slip *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Upload image (JPEG, PNG) or PDF file. Max size: 10MB
                  </Form.Text>
                  {bankSlip && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Selected: {bankSlip.name}
                      </small>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h5 className="mb-3">
              <i className="bi bi-cart me-2"></i>
              Order Summary
            </h5>
            
            <div className="checkout-items mb-3">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item d-flex mb-2 p-2 border rounded">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="cart-item-image" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px' }} 
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="mb-1 text-muted">Quantity: {item.quantity}</p>
                    <p className="mb-0 fw-bold">LKR {item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
              
              <div className="total-section p-3 bg-primary text-white rounded">
                <h4 className="mb-0 text-center">
                  <i className="bi bi-currency-rupee me-2"></i>
                  Total: LKR {totalPrice.toFixed(2)}
                </h4>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            form="checkout-form"
            disabled={loading || !bankSlip}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Place Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutPopup;
