import React, { useEffect, useState } from 'react';
import API from '../../axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/admin/users');
      setUsers(res.data || []);
      setError('');
    } catch (e) {
      console.error('Error fetching users:', e);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="container mt-4"><h3>Loading users...</h3></div>;
  }

  if (error) {
    return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        {/* Card header with title + refresh */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Manage Users</h5>
            <small className="text-muted">Overview of all registered users</small>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </div>

        {/* Compact stats strip */}
        <div className="card-body border-bottom pb-2 pt-3">
          <div className="row g-2">
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 rounded border bg-light">
                <i className="bi bi-people-fill text-primary me-2"></i>
                <span className="text-muted small me-auto">Total Users</span>
                <span className="fw-bold">{users.length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 rounded border bg-light">
                <i className="bi bi-person-badge text-success me-2"></i>
                <span className="text-muted small me-auto">Admins</span>
                <span className="fw-bold">{users.filter(u => u.role === 'ROLE_ADMIN').length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 rounded border bg-light">
                <i className="bi bi-person-check-fill text-info me-2"></i>
                <span className="text-muted small me-auto">Customers</span>
                <span className="fw-bold">{users.filter(u => u.role === 'ROLE_CUSTOMER').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="table-responsive" style={{maxHeight:'60vh'}}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light" style={{position:'sticky', top:0, zIndex:1}}>
              <tr>
                <th style={{minWidth:'180px'}}>Name</th>
                <th style={{minWidth:'220px'}}>Email</th>
                <th>Phone</th>
                <th style={{minWidth:'260px'}}>Address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{width:'32px',height:'32px'}}>
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="fw-semibold">{u.name || '-'}</div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td className="text-truncate" style={{maxWidth:'320px'}}>{u.address || '-'}</td>
                  <td>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;


