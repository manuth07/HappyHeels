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
      setError('FAILED TO LOAD USERS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="container-fluid max-width-1200 px-4 text-center" style={{ marginTop: '100px' }}><h4 className="fw-bold uppercase">LOADING USERS...</h4></div>;
  }

  if (error) {
    return <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '100px' }}><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: '100px', marginBottom: '50px' }}>
      <div className="border border-2 border-dark bg-white" style={{ boxShadow: '4px 4px 0px #000000' }}>
        <div className="border-bottom border-2 border-dark p-3 bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold text-uppercase mb-0">MANAGE USERS</h4>
            <small className="text-uppercase text-muted fw-bold">REGISTERED ACCOUNTS OVERVIEW</small>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? 'REFRESHING' : 'REFRESH'}
          </button>
        </div>

        <div className="p-3 border-bottom border-dark bg-light">
          <div className="row g-2">
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 border border-dark bg-white">
                <span className="text-uppercase fw-bold small me-auto">TOTAL USERS</span>
                <span className="fw-bold fs-5">{users.length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 border border-dark bg-white">
                <span className="text-uppercase fw-bold small me-auto">ADMINS</span>
                <span className="fw-bold fs-5">{users.filter(u => u.role === 'ROLE_ADMIN').length}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="d-flex align-items-center p-2 border border-dark bg-white">
                <span className="text-uppercase fw-bold small me-auto">CUSTOMERS</span>
                <span className="fw-bold fs-5">{users.filter(u => u.role === 'ROLE_CUSTOMER').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>ADDRESS</th>
                <th>ROLE</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.address || '-'}</td>
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
