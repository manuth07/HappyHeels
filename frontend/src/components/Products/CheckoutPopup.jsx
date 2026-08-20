import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import API from '../../axios';
import AppContext from '../../Context/Context';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, onOrderSuccess }) => {
  const { user } = useContext(AppContext);
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      
      setBankSlip(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setError('Please log in to place an order.');
      return;
    }
    
    if (!formData.customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!formData.shippingAddress.trim()) {
      setError('Please enter your shipping address.');
      return;
    }
    if (!bankSlip) {
      setError('Please upload a payment bank slip.');
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
      
      await API.post('/orders', formDataToSend);

      setSuccess('Order placed successfully! Pending payment verification.');
      
      setFormData({
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        shippingAddress: ''
      });
      setBankSlip(null);
      
      setTimeout(() => {
        onOrderSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
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
    <Modal show={show} onHide={handleCloseModal} size="lg" centered>
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="section-title mb-0">
          Checkout & Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            {success}
          </Alert>
        )}

        <Form id="checkout-form" onSubmit={handleSubmit}>
          <Row className="gy-3">
            <Col md={6}>
              <h5 className="fw-semibold mb-3 border-bottom pb-2" style={{ fontSize: "15px", color: "#111111" }}>
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
                  placeholder="John Doe"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
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
                  placeholder="+94 77 123 4567"
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
                  placeholder="123 Main Street, Colombo, Sri Lanka"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <h5 className="fw-semibold mb-3 border-bottom pb-2" style={{ fontSize: "15px", color: "#111111" }}>
                Payment Details
              </h5>

              <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#F7F7F8" }}>
                <h6 className="fw-semibold mb-2" style={{ fontSize: "14px", color: "#111111" }}>Bank Transfer Instructions</h6>
                <p className="mb-1 subtitle"><strong>Account Name:</strong> Happy Heels Store</p>
                <p className="mb-1 subtitle"><strong>Bank:</strong> Commercial Bank</p>
                <p className="mb-0 subtitle"><strong>Account No:</strong> 1234567890</p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Upload Bank Slip *</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
                {bankSlip && (
                  <div className="mt-2 subtitle text-success fw-medium">
                    Selected: {bankSlip.name}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4 border-light" />

          <h5 className="fw-semibold mb-3" style={{ fontSize: "15px", color: "#111111" }}>
            Order Summary
          </h5>
          
          <div className="checkout-items mb-3">
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex align-items-center mb-2 p-2 border rounded-3 bg-white">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E5E5', marginRight: '12px' }} 
                />
                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-medium" style={{ fontSize: "14px", color: "#111111" }}>{item.name}</h6>
                  <small className="subtitle">Qty: {item.quantity}</small>
                </div>
                <div className="fw-semibold" style={{ fontSize: "14px", color: "#111111" }}>
                  LKR {item.price * item.quantity}
                </div>
              </div>
            ))}
            
            <div className="p-3 border rounded-3 text-end mt-3" style={{ backgroundColor: "#F7F7F8" }}>
              <span className="fw-bold fs-5" style={{ color: "#111111" }}>
                Total: LKR {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-top pt-3">
        <Button variant="secondary" className="btn-light" onClick={handleCloseModal} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          form="checkout-form"
          disabled={loading || !bankSlip}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutPopup;
