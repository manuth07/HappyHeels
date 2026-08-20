import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, Alert, Table } from 'react-bootstrap';
import API from '../../axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBankSlipModal, setShowBankSlipModal] = useState(false);
  const [bankSlipImage, setBankSlipImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get('/orders/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await API.put(`/orders/admin/${orderId}/status?status=${newStatus}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const viewBankSlip = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/orders/${orderId}/bank-slip`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const imageUrl = URL.createObjectURL(blob);
      setBankSlipImage(imageUrl);
      setShowBankSlipModal(true);
    } catch (error) {
      console.error('Error fetching bank slip:', error);
      setError('Failed to load bank slip');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-purple">Pending</span>;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <span className="badge badge-dark">Processing</span>;
      case 'SHIPPED':
      case 'DELIVERED':
        return <span className="badge badge-neutral">Delivered</span>;
      case 'CANCELLED':
        return <span className="badge bg-danger text-white">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const pendingCount = orders.filter(order => order.status === 'PENDING').length;

  if (loading) {
    return (
      <Container style={{ marginTop: '90px' }} className="text-center py-5">
        <div className="spinner-border text-dark mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="subtitle">Loading orders...</p>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '68px', marginBottom: '50px' }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4 p-3 border rounded-3 bg-white">
            <h3 className="section-title mb-0">Order Management</h3>
            {pendingCount > 0 && (
              <span className="badge badge-purple fs-6">
                {pendingCount} Pending
              </span>
            )}
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="rounded-3">
              {error}
            </Alert>
          )}

          {/* Filter Buttons (Styleguide Horizontal Pills) */}
          <div className="mb-4 d-flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All Orders' : f}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="border rounded-3 bg-white p-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <h5 className="h2 mb-2">No orders found</h5>
                <p className="subtitle">There are no orders under this filter.</p>
              </div>
            ) : (
              <Table responsive hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Slip</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>
                        <div>
                          <strong style={{ color: '#111111' }}>{order.customerName}</strong>
                          <br />
                          <small className="subtitle">{order.customerEmail}</small>
                        </div>
                      </td>
                      <td><strong>LKR {order.totalAmount}</strong></td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        {order.hasBankSlip ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => viewBankSlip(order.id)}
                          >
                            View Slip
                          </button>
                        ) : (
                          <span className="badge badge-neutral">No Slip</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="section-title mb-0">
            Order Details - #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedOrder && (
            <div>
              <Row className="g-3">
                <Col md={6}>
                  <h6 className="fw-semibold border-bottom pb-2 mb-2" style={{ color: '#111111' }}>Customer Details</h6>
                  <p className="mb-1 subtitle"><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p className="mb-1 subtitle"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p className="mb-1 subtitle"><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <p className="mb-1 subtitle"><strong>Address:</strong> {selectedOrder.shippingAddress}</p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-semibold border-bottom pb-2 mb-2" style={{ color: '#111111' }}>Order Info</h6>
                  <p className="mb-1 subtitle"><strong>Total:</strong> LKR {selectedOrder.totalAmount}</p>
                  <p className="mb-1 subtitle"><strong>Status:</strong> {selectedOrder.status}</p>
                  <p className="mb-1 subtitle"><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                </Col>
              </Row>

              <hr className="my-3 border-light" />

              <h6 className="fw-semibold mb-3" style={{ color: '#111111' }}>Items</h6>
              <Table size="sm" responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>LKR {item.price}</td>
                      <td>LKR {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Form.Select
              value={selectedOrder?.status}
              onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
              disabled={updating}
              style={{ maxWidth: '200px' }}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </Form.Select>
            <Button
              variant="primary"
              onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
              disabled={updating}
            >
              Update Status
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Bank Slip Modal */}
      <Modal show={showBankSlipModal} onHide={() => setShowBankSlipModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="section-title mb-0">
            Bank Slip - Order #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          {bankSlipImage ? (
            <img
              src={bankSlipImage}
              alt="Bank Slip"
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', border: '1px solid #E5E5E5' }}
            />
          ) : (
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading slip...</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <Button variant="secondary" className="btn-light" onClick={() => setShowBankSlipModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageOrders;
