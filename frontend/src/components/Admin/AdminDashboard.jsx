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
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h1>🏪 Admin Dashboard</h1>
                    <p className="text-muted">Welcome back, {user?.name}!</p>
                    
                    <div className="row mt-4">
                        {/* Products Management */}
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-primary">
                                <div className="card-body">
                                    <h5 className="card-title">📦 Manage Products</h5>
                                    <p className="card-text">Add, edit, or remove products from your store</p>
                                    <Link to="/add_product" className="btn btn-light">
                                        Manage Products
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* User Management */}
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-success">
                                <div className="card-body">
                                    <h5 className="card-title">👥 Manage Users</h5>
                                    <p className="card-text">View and manage customer accounts</p>
                                    <Link to="/admin/users" className="btn btn-light">
                                        View Users
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* Orders Management */}
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-warning">
                                <div className="card-body">
                                    <h5 className="card-title">📋 Manage Orders</h5>
                                    <p className="card-text">View orders, bank slips, and update order status</p>
                                    {stats.pendingOrders > 0 && (
                                        <p className="card-text">
                                            <span className="badge bg-danger me-2">{stats.pendingOrders}</span>
                                            Pending Orders
                                        </p>
                                    )}
                                    <Link to="/admin/orders" className="btn btn-light">
                                        Manage Orders
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Quick Stats</h5>
                                    <div className="row text-center">
                                        <div className="col-md-3">
                                            <h3>{stats.totalProducts}</h3>
                                            <p className="text-muted">Total Products</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3>{stats.totalUsers}</h3>
                                            <p className="text-muted">Total Users</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3>{stats.pendingOrders}</h3>
                                            <p className="text-muted">Pending Orders</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3>LKR {stats.totalRevenue.toFixed(2)}</h3>
                                            <p className="text-muted">Total Revenue</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;