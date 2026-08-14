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
      setError('FAILED TO FETCH ORDERS');
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
      setError('FAILED TO UPDATE ORDER STATUS');
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
      setError('FAILED TO LOAD BANK SLIP');
    }
  };

  const getStatusBadge = (status) => {
    return <Badge>{status}</Badge>;
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
      <Container style={{ marginTop: '100px' }} className="text-center py-5">
        <h4 className="fw-bold text-uppercase">LOADING ORDERS...</h4>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '100px', marginBottom: '50px' }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4 p-3 border border-2 border-dark bg-white" style={{ boxShadow: '4px 4px 0px #000000' }}>
            <h3 className="fw-bold text-uppercase mb-0">ORDER MANAGEMENT</h3>
            {pendingCount > 0 && (
              <Badge bg="danger" className="fs-6">
                {pendingCount} PENDING
              </Badge>
            )}
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="rounded-0 border-dark">
              {error}
            </Alert>
          )}

          {/* Filter Buttons */}
          <div className="mb-4 d-flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'outline-primary'}
                onClick={() => setFilter(f)}
                className="btn-sm"
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="border border-2 border-dark bg-white p-3" style={{ boxShadow: '4px 4px 0px #000000' }}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <h5 className="fw-bold text-uppercase">NO ORDERS FOUND</h5>
              </div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>SLIP</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>
                        <div>
                          <strong>{order.customerName}</strong>
                          <br />
                          <small className="text-muted">{order.customerEmail}</small>
                        </div>
                      </td>
                      <td><strong>LKR {order.totalAmount}</strong></td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        {order.hasBankSlip ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewBankSlip(order.id)}
                          >
                            VIEW SLIP
                          </Button>
                        ) : (
                          <Badge bg="secondary">NO SLIP</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          MANAGE
                        </Button>
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
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-uppercase">
            ORDER DETAILS - #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="g-3">
                <Col md={6}>
                  <h6 className="fw-bold text-uppercase border-bottom border-dark pb-2">CUSTOMER DETAILS</h6>
                  <p className="mb-1"><strong>NAME:</strong> {selectedOrder.customerName}</p>
                  <p className="mb-1"><strong>EMAIL:</strong> {selectedOrder.customerEmail}</p>
                  <p className="mb-1"><strong>PHONE:</strong> {selectedOrder.customerPhone}</p>
                  <p className="mb-1"><strong>ADDRESS:</strong> {selectedOrder.shippingAddress}</p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold text-uppercase border-bottom border-dark pb-2">ORDER INFO</h6>
                  <p className="mb-1"><strong>TOTAL:</strong> LKR {selectedOrder.totalAmount}</p>
                  <p className="mb-1"><strong>STATUS:</strong> {selectedOrder.status}</p>
                  <p className="mb-1"><strong>DATE:</strong> {formatDate(selectedOrder.orderDate)}</p>
                </Col>
              </Row>

              <hr className="border-dark" />

              <h6 className="fw-bold text-uppercase mb-3">ITEMS</h6>
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>QTY</th>
                    <th>PRICE</th>
                    <th>SUBTOTAL</th>
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
        <Modal.Footer>
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
              UPDATE STATUS
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Bank Slip Modal */}
      <Modal show={showBankSlipModal} onHide={() => setShowBankSlipModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-uppercase">
            BANK SLIP - ORDER #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {bankSlipImage ? (
            <img
              src={bankSlipImage}
              alt="Bank Slip"
              style={{ maxWidth: '100%', maxHeight: '500px', border: '2px solid #000' }}
            />
          ) : (
            <h5 className="fw-bold text-uppercase">LOADING SLIP...</h5>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBankSlipModal(false)}>
            CLOSE
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageOrders;
