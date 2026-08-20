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
        <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '68px', marginBottom: '50px' }}>
            <div className="border rounded-3 p-4 bg-white mb-4">
                <h1 className="page-title mb-1">Admin Dashboard</h1>
                <p className="subtitle mb-0">Welcome back, {user?.name}</p>
            </div>
            
            <div className="row g-4 mb-4">
                {/* Products Management */}
                <div className="col-md-4">
                    <div className="border rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h4 className="section-title mb-1">Manage Products</h4>
                            <p className="subtitle mb-4">Add, edit, or remove footwear items from catalog</p>
                        </div>
                        <Link to="/add_product" className="btn btn-primary w-100">
                            <i className="bi bi-plus-lg me-1"></i> Manage Products
                        </Link>
                    </div>
                </div>
                
                {/* User Management */}
                <div className="col-md-4">
                    <div className="border rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h4 className="section-title mb-1">Manage Users</h4>
                            <p className="subtitle mb-4">View registered customer accounts</p>
                        </div>
                        <Link to="/admin/users" className="btn btn-primary w-100">
                            <i className="bi bi-people me-1"></i> View Users
                        </Link>
                    </div>
                </div>
                
                {/* Orders Management */}
                <div className="col-md-4">
                    <div className="border rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <h4 className="section-title mb-0">Manage Orders</h4>
                                {stats.pendingOrders > 0 && (
                                    <span className="badge badge-purple">{stats.pendingOrders} Pending</span>
                                )}
                            </div>
                            <p className="subtitle mb-4">Verify payments and process shipments</p>
                        </div>
                        <Link to="/admin/orders" className="btn btn-primary w-100">
                            <i className="bi bi-receipt me-1"></i> Manage Orders
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Quick Stats */}
            <div className="border rounded-3 p-4 bg-white">
                <h4 className="section-title border-bottom pb-3 mb-4">Platform Metrics</h4>
                <div className="row text-center g-3">
                    <div className="col-md-3 col-6">
                        <div className="border rounded-3 p-3" style={{ backgroundColor: "#F7F7F8" }}>
                            <h2 className="fw-bold mb-1" style={{ color: "#111111" }}>{stats.totalProducts}</h2>
                            <p className="subtitle mb-0">Total Products</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border rounded-3 p-3" style={{ backgroundColor: "#F7F7F8" }}>
                            <h2 className="fw-bold mb-1" style={{ color: "#111111" }}>{stats.totalUsers}</h2>
                            <p className="subtitle mb-0">Total Users</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border rounded-3 p-3" style={{ backgroundColor: "#F7F7F8" }}>
                            <h2 className="fw-bold mb-1" style={{ color: "#111111" }}>{stats.pendingOrders}</h2>
                            <p className="subtitle mb-0">Pending Orders</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="border rounded-3 p-3" style={{ backgroundColor: "#F7F7F8" }}>
                            <h2 className="fw-bold mb-1" style={{ color: "#7B2CBF" }}>LKR {stats.totalRevenue.toFixed(2)}</h2>
                            <p className="subtitle mb-0">Total Revenue</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;