import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppContext from '../../Context/Context';
import API from '../../axios';

const AdminDashboard = () => {
    const { user } = useContext(AppContext);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await API.get('/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        if (user?.role === 'ROLE_ADMIN') {
            fetchStats();
        }
    }, [user]);

    return (
        <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '100px', marginBottom: '50px' }}>
            <div className="border border-2 border-dark p-4 bg-white mb-4" style={{ boxShadow: '4px 4px 0px #000000' }}>
                <h1 className="fw-bold text-uppercase tracking-wider mb-2">ADMIN DASHBOARD</h1>
                <p className="fw-bold text-uppercase text-muted mb-0">WELCOME BACK, {user?.name}</p>
            </div>
            
            <div className="row g-4 mb-4">
                {/* Products Management */}
                <div className="col-md-4">
                    <div className="border border-2 border-dark p-4 bg-white h-100 d-flex flex-column justify-content-between" style={{ boxShadow: '4px 4px 0px #000000' }}>
                        <div>
                            <h4 className="fw-bold text-uppercase mb-2">MANAGE PRODUCTS</h4>
                            <p className="small text-uppercase text-muted mb-4">ADD, EDIT, OR REMOVE INVENTORY ITEMS</p>
                        </div>
                        <Link to="/add_product" className="btn btn-primary w-100">
                            MANAGE PRODUCTS
                        </Link>
                    </div>
                </div>
                
                {/* User Management */}
                <div className="col-md-4">
                    <div className="border border-2 border-dark p-4 bg-white h-100 d-flex flex-column justify-content-between" style={{ boxShadow: '4px 4px 0px #000000' }}>
                        <div>
                            <h4 className="fw-bold text-uppercase mb-2">MANAGE USERS</h4>
                            <p className="small text-uppercase text-muted mb-4">VIEW AND CONTROL CUSTOMER ACCOUNTS</p>
                        </div>
                        <Link to="/admin/users" className="btn btn-primary w-100">
                            VIEW USERS
                        </Link>
                    </div>
                </div>
                
                {/* Orders Management */}
                <div className="col-md-4">
                    <div className="border border-2 border-dark p-4 bg-white h-100 d-flex flex-column justify-content-between" style={{ boxShadow: '4px 4px 0px #000000' }}>
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <h4 className="fw-bold text-uppercase mb-0">MANAGE ORDERS</h4>
                                {stats.pendingOrders > 0 && (
                                    <span className="badge bg-danger text-white">{stats.pendingOrders} PENDING</span>
                                )}
                            </div>
                            <p className="small text-uppercase text-muted mb-4">VERIFY PAYMENTS AND PROCESS SHIPMENTS</p>
                        </div>
                        <Link to="/admin/orders" className="btn btn-primary w-100">
                            MANAGE ORDERS
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Quick Stats */}
            <div className="border border-2 border-dark p-4 bg-white" style={{ boxShadow: '4px 4px 0px #000000' }}>
                <h4 className="fw-bold text-uppercase border-bottom border-dark pb-3 mb-4">PLATFORM METRICS</h4>
                <div className="row text-center g-3">
                    <div className="col-md-3 col-6">
                        <div className="border border-dark p-3 bg-light">
                            <h2 className="fw-bold mb-1">{stats.totalProducts}</h2>
                            <p className="small text-uppercase fw-bold text-muted mb-0">TOTAL PRODUCTS</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border border-dark p-3 bg-light">
                            <h2 className="fw-bold mb-1">{stats.totalUsers}</h2>
                            <p className="small text-uppercase fw-bold text-muted mb-0">TOTAL USERS</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border border-dark p-3 bg-light">
                            <h2 className="fw-bold mb-1">{stats.pendingOrders}</h2>
                            <p className="small text-uppercase fw-bold text-muted mb-0">PENDING ORDERS</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border border-dark p-3 bg-light" style={{ backgroundColor: '#E2FF00' }}>
                            <h2 className="fw-bold mb-1">LKR {stats.totalRevenue.toFixed(2)}</h2>
                            <p className="small text-uppercase fw-bold text-dark mb-0">TOTAL REVENUE</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;