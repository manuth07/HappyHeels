import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Spinner, Table } from 'react-bootstrap';
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
      
      // Update local state
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
    const variants = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PROCESSING': 'primary',
      'SHIPPED': 'success',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const pendingCount = orders.filter(order => order.status === 'PENDING').length;

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading orders...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-clipboard-check me-2"></i>
              Order Management
            </h2>
            {pendingCount > 0 && (
              <Badge bg="danger" className="fs-6">
                {pendingCount} Pending Orders
              </Badge>
            )}
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Filter Buttons */}
          <div className="mb-3">
            <Button
              variant={filter === 'ALL' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('ALL')}
              className="me-2"
            >
              All Orders
            </Button>
            <Button
              variant={filter === 'PENDING' ? 'warning' : 'outline-warning'}
              onClick={() => setFilter('PENDING')}
              className="me-2"
            >
              Pending
            </Button>
            <Button
              variant={filter === 'CONFIRMED' ? 'info' : 'outline-info'}
              onClick={() => setFilter('CONFIRMED')}
              className="me-2"
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'PROCESSING' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('PROCESSING')}
              className="me-2"
            >
              Processing
            </Button>
            <Button
              variant={filter === 'SHIPPED' ? 'success' : 'outline-success'}
              onClick={() => setFilter('SHIPPED')}
              className="me-2"
            >
              Shipped
            </Button>
          </div>

          {/* Orders Table */}
          <Card>
            <Card.Body>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <p className="text-muted">No orders found</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Bank Slip</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{order.customerName}</strong>
                            <br />
                            <small className="text-muted">{order.customerEmail}</small>
                          </div>
                        </td>
                        <td>
                          <strong>LKR {order.totalAmount}</strong>
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>
                          {order.hasBankSlip ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => viewBankSlip(order.id)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View Slip
                            </Button>
                          ) : (
                            <Badge bg="secondary">No Slip</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                          >
                            <i className="bi bi-gear me-1"></i>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row>
                <Col md={6}>
                  <h6><i className="bi bi-person me-2"></i>Customer Information</h6>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <p><strong>Address:</strong> {selectedOrder.shippingAddress}</p>
                </Col>
                <Col md={6}>
                  <h6><i className="bi bi-cart me-2"></i>Order Information</h6>
                  <p><strong>Total:</strong> LKR {selectedOrder.totalAmount}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                  <p><strong>Bank Slip:</strong> {selectedOrder.hasBankSlip ? 'Available' : 'Not provided'}</p>
                </Col>
              </Row>

              <hr />

              <h6><i className="bi bi-list-ul me-2"></i>Order Items</h6>
              <div className="table-responsive">
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
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

              {selectedOrder.hasBankSlip && (
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    onClick={() => viewBankSlip(selectedOrder.id)}
                  >
                    <i className="bi bi-image me-2"></i>
                    View Bank Slip
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex gap-2">
            <Form.Select
              value={selectedOrder?.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                setSelectedOrder({...selectedOrder, status: newStatus});
              }}
              disabled={updating}
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Form.Select>
            <Button
              variant="primary"
              onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Bank Slip Modal */}
      <Modal show={showBankSlipModal} onHide={() => setShowBankSlipModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-receipt me-2"></i>
            Bank Slip - Order #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {bankSlipImage ? (
            <img
              src={bankSlipImage}
              alt="Bank Slip"
              style={{ maxWidth: '100%', maxHeight: '500px' }}
              className="border rounded"
            />
          ) : (
            <div className="py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading bank slip...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBankSlipModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageOrders;




