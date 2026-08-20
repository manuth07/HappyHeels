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
    return (
      <div className="container-fluid max-width-1200 px-4 text-center" style={{ marginTop: '90px' }}>
        <div className="spinner-border text-dark mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="subtitle">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '90px' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '68px', marginBottom: '50px' }}>
      <div className="border rounded-3 bg-white">
        <div className="border-bottom p-3 bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="section-title mb-0">Manage Users</h4>
            <small className="subtitle">Registered customer accounts overview</small>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="p-3 border-bottom" style={{ backgroundColor: '#F7F7F8' }}>
          <div className="row g-3">
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-3 border rounded-3 bg-white">
                <span className="subtitle me-auto">Total Users</span>
                <span className="fw-bold fs-5" style={{ color: '#111111' }}>{users.length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-3 border rounded-3 bg-white">
                <span className="subtitle me-auto">Administrators</span>
                <span className="fw-bold fs-5" style={{ color: '#7B2CBF' }}>{users.filter(u => u.role === 'ROLE_ADMIN').length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-3 border rounded-3 bg-white">
                <span className="subtitle me-auto">Customers</span>
                <span className="fw-bold fs-5" style={{ color: '#111111' }}>{users.filter(u => u.role === 'ROLE_CUSTOMER').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold" style={{ color: '#111111' }}>{u.name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.address || '-'}</td>
                  <td>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-purple' : 'badge-neutral'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
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
