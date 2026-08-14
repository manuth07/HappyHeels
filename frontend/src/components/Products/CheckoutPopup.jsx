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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('PLEASE UPLOAD A VALID IMAGE (JPEG, PNG) OR PDF FILE');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('FILE SIZE MUST BE LESS THAN 10MB');
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
      setError('PLEASE LOGIN TO PLACE AN ORDER');
      return;
    }
    
    if (!formData.customerName.trim()) {
      setError('PLEASE ENTER YOUR FULL NAME');
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError('PLEASE ENTER YOUR EMAIL');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('PLEASE ENTER YOUR PHONE NUMBER');
      return;
    }
    if (!formData.shippingAddress.trim()) {
      setError('PLEASE ENTER YOUR SHIPPING ADDRESS');
      return;
    }
    if (!bankSlip) {
      setError('PLEASE UPLOAD A BANK SLIP');
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

      setSuccess('ORDER PLACED SUCCESSFULLY! PENDING PAYMENT VERIFICATION.');
      
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
      setError(error.response?.data?.message || 'FAILED TO PLACE ORDER. PLEASE TRY AGAIN.');
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
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-uppercase">
          CHECKOUT & PAYMENT
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3 rounded-0 border-dark">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3 rounded-0 border-dark bg-warning text-dark border-2">
            {success}
          </Alert>
        )}

        <Form id="checkout-form" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <h5 className="fw-bold text-uppercase mb-3 border-bottom border-dark pb-2">
                CUSTOMER INFORMATION
              </h5>
              
              <Form.Group className="mb-3">
                <Form.Label>FULL NAME *</Form.Label>
                <Form.Control
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="FULL NAME"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>EMAIL *</Form.Label>
                <Form.Control
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="EMAIL ADDRESS"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>PHONE NUMBER *</Form.Label>
                <Form.Control
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="PHONE NUMBER"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>SHIPPING ADDRESS *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="COMPLETE SHIPPING ADDRESS"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <h5 className="fw-bold text-uppercase mb-3 border-bottom border-dark pb-2">
                PAYMENT INSTRUCTIONS
              </h5>

              <div className="p-3 bg-light border border-2 border-dark mb-3">
                <h6 className="fw-bold text-uppercase mb-2">BANK TRANSFER DETAILS:</h6>
                <p className="mb-1 small"><strong>ACCOUNT:</strong> HAPPYHEELS STORE</p>
                <p className="mb-1 small"><strong>BANK:</strong> COMMERCIAL BANK</p>
                <p className="mb-0 small"><strong>ACCOUNT NO:</strong> 1234567890</p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>UPLOAD BANK SLIP *</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
                {bankSlip && (
                  <div className="mt-2 text-uppercase fw-bold small text-success">
                    SELECTED: {bankSlip.name}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <hr className="border-dark" />

          <h5 className="fw-bold text-uppercase mb-3">
            ORDER SUMMARY
          </h5>
          
          <div className="checkout-items mb-3">
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex align-items-center mb-2 p-2 border border-dark bg-white">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #000', marginRight: '15px' }} 
                />
                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-bold text-uppercase">{item.name}</h6>
                  <small className="text-muted fw-bold">QTY: {item.quantity}</small>
                </div>
                <div className="fw-bold fs-6">
                  LKR {item.price * item.quantity}
                </div>
              </div>
            ))}
            
            <div className="p-3 bg-dark text-white text-end border border-2 border-dark mt-3">
              <h4 className="mb-0 fw-bold text-uppercase" style={{ letterSpacing: '1.5px' }}>
                TOTAL: LKR {totalPrice.toFixed(2)}
              </h4>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
          CANCEL
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          form="checkout-form"
          disabled={loading || !bankSlip}
        >
          {loading ? 'PROCESSING...' : 'PLACE ORDER'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutPopup;
