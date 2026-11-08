import useCollection from '../hooks/useCollection';
import CollectionStatus from '../components/CollectionStatus';
import React, { useState, useMemo } from 'react';
import { Search, Plus, ShieldCheck, UserCheck, Key, Lock, Edit2, X, Check, Building2 } from 'lucide-react';


const ROLES = ['All', 'Super Admin', 'Chief Librarian', 'Senior Librarian', 'Circulation Officer', 'Cataloger Specialist'];

export default function AdminLibrariansPage() {
  const [staffList, setStaffList, collectionStatus] = useCollection('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // New staff form
  const [newStaffForm, setNewStaffForm] = useState({
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'Circulation Officer',
    branch: 'Central Reading Room (Lajpat Nagar)',
    permissions: ['Check-in/Check-out', 'Member Registration'],
  });

  // Filtered dataset
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = selectedRole === 'All' || s.role === selectedRole;

      return matchSearch && matchRole;
    });
  }, [staffList, searchTerm, selectedRole]);

  // Aggregate KPI counters
  const totalStaff = staffList.length;
  const activeNow = staffList.filter((s) => s.status === 'active').length;
  const adminCount = staffList.filter((s) => s.role.includes('Admin') || s.role.includes('Chief')).length;

  // Add staff
  const handleInviteStaff = async (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      name: newStaffForm.name,
      email: newStaffForm.email,
      phone: newStaffForm.phone,
      role: newStaffForm.role,
      branch: newStaffForm.branch,
      permissions: newStaffForm.permissions,
      status: 'active',
      password: newStaffForm.password,
      twoFactor: false,
    };
    if (!(await setStaffList([created, ...staffList]))) return;
    setIsInviteModalOpen(false);
    setNewStaffForm({
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'Circulation Officer',
      branch: 'Central Reading Room (Lajpat Nagar)',
      permissions: ['Check-in/Check-out', 'Member Registration'],
    });
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!(await setStaffList(
      staffList.map((s) => (s.id === editingStaff.id ? { ...s, ...editingStaff } : s))
    ))) return;
    setEditingStaff(null);
  };

  // Toggle permission in form
  const togglePermission = (perm, isEdit = false) => {
    if (isEdit) {
      const curr = editingStaff.permissions || [];
      const updated = curr.includes(perm) ? curr.filter((p) => p !== perm) : [...curr, perm];
      setEditingStaff({ ...editingStaff, permissions: updated });
    } else {
      const curr = newStaffForm.permissions || [];
      const updated = curr.includes(perm) ? curr.filter((p) => p !== perm) : [...curr, perm];
      setNewStaffForm({ ...newStaffForm, permissions: updated });
    }
  };

  // Monogram helper
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="admin-bookings-page admin-librarians-page">
      <CollectionStatus {...collectionStatus} />
      <fieldset disabled={collectionStatus.loading || collectionStatus.saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      {/* 1. Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA ACCESS CONTROL &amp; STAFF ROLES</span>
          <h1 className="bookings-main-title">Librarians &amp; Staff Administration</h1>
          <p className="bookings-subtitle">
            Manage staff accounts, assign operational roles, audit security permissions, and oversee circulation staff.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setIsInviteModalOpen(true)}
            title="Invite a new staff member"
          >
            <Plus size={14} className="pill-cal-icon" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL STAFF</span>
            <div className="kpi-icon-wrap"><ShieldCheck size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalStaff}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Registered librarians</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ACTIVE ON DUTY</span>
            <div className="kpi-icon-wrap"><UserCheck size={17} /></div>
          </div>
          <div className="kpi-main-number">{activeNow}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Operating desks</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ADMINISTRATIVE ROLES</span>
            <div className="kpi-icon-wrap"><Key size={17} /></div>
          </div>
          <div className="kpi-main-number">{adminCount}</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Super Admin &amp; Chiefs</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">2FA ENFORCEMENT</span>
            <div className="kpi-icon-wrap"><Lock size={17} /></div>
          </div>
          <div className="kpi-main-number">100%</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Fully Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Role Filter Tabs */}
      <div className="catalog-controls-container">
        <div className="catalog-category-tabs" role="tablist">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className={`cat-pill-tab ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              <span>{role}</span>
              <span className="cat-count">
                {role === 'All'
                  ? staffList.length
                  : staffList.filter((s) => s.role === role).length}
              </span>
            </button>
          ))}
        </div>

        <div className="bookings-filter-bar">
          <div className="filter-search-box">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search staff by name, email, or facility location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Staff Directory Table */}
      <div className="bookings-table-wrapper">
        <table className="bookings-data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role &amp; Title</th>
              <th>Assigned Facility</th>
              <th>Permissions</th>
              <th>Last Active</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((staff) => (
              <tr key={staff.id}>
                <td>
                  <div className="visitor-cell-wrap">
                    <div className="avatar-monogram-circle staff-avatar">
                      {getInitials(staff.name)}
                    </div>
                    <div className="visitor-text-info">
                      <span className="visitor-primary-name">{staff.name}</span>
                      <span className="visitor-secondary-email font-mono text-xs">{staff.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`category-pill-badge ${staff.role.includes('Admin') ? 'badge-admin' : ''}`}>
                    {staff.role}
                  </span>
                </td>
                <td>
                  <div className="facility-cell-wrap">
                    <Building2 size={13} className="text-stone-400 inline mr-1" />
                    <span className="text-sm font-medium">{staff.branch}</span>
                  </div>
                </td>
                <td>
                  <div className="permissions-chips-wrap">
                    {staff.permissions.slice(0, 2).map((perm) => (
                      <span key={perm} className="perm-chip">{perm}</span>
                    ))}
                    {staff.permissions.length > 2 && (
                      <span className="perm-chip-more">+{staff.permissions.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="font-mono text-xs text-stone-500">{staff.lastActive}</span>
                </td>
                <td>
                  {staff.status === 'active' ? (
                    <span className="status-pill pill-active">Active</span>
                  ) : (
                    <span className="status-pill pill-amber">On Leave</span>
                  )}
                </td>
                <td className="td-actions">
                  <div className="row-actions-group">
                    <button
                      type="button"
                      className="action-icon-btn"
                      onClick={() => setEditingStaff({ ...staff })}
                      title="Edit Permissions &amp; Roles"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. INVITE STAFF MODAL */}
      {isInviteModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">STAFF ONBOARDING</span>
                <h2 className="dialog-title">Add Staff Account</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="catalog-modal-form">
              <div className="form-field-item">
                <label htmlFor="initial-staff-password">Initial password *</label>
                <input id="initial-staff-password" type="password" autoComplete="new-password" minLength={12} required value={newStaffForm.password} onChange={(event) => setNewStaffForm({ ...newStaffForm, password: event.target.value })} />
                <small>At least 12 characters. Share the account credentials securely with the staff member.</small>
              </div>
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenjiro Sato"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Work Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kenjiro@library.delhi"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98111 22334"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Operational Role</label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  >
                    {ROLES.filter((r) => r !== 'All').map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field-item">
                <label>Assigned Library Facility / Branch</label>
                <select
                  value={newStaffForm.branch}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, branch: e.target.value })}
                >
                  <option value="Central Reading Room (Lajpat Nagar)">Central Reading Room (Lajpat Nagar)</option>
                  <option value="Manga Corner & Media Center">Manga Corner &amp; Media Center</option>
                  <option value="Japanese Language Lab">Japanese Language Lab</option>
                  <option value="Special Collections & Arts Pavilion">Special Collections &amp; Arts Pavilion</option>
                </select>
              </div>

              <div className="form-field-item">
                <label>Permission Modules</label>
                <div className="permissions-checkbox-grid">
                  {[
                    'Check-in/Check-out',
                    'Catalog Management',
                    'Member Registration',
                    'Collect Fines',
                    'Waive Fines (Supervisor)',
                    'Manage Settings & Capacities',
                    'Export Audit Logs',
                  ].map((perm) => (
                    <label key={perm} className="perm-checkbox-item">
                      <input
                        type="checkbox"
                        checked={newStaffForm.permissions.includes(perm)}
                        onChange={() => togglePermission(perm, false)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Plus size={15} />
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT STAFF PERMISSIONS MODAL */}
      {editingStaff && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingStaff(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">ACCESS CONTROL</span>
                <h2 className="dialog-title">Edit Privileges · {editingStaff.name}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setEditingStaff(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  >
                    {ROLES.filter((r) => r !== 'All').map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field-item">
                  <label>Status</label>
                  <select
                    value={editingStaff.status}
                    onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                  >
                    <option value="active">Active On Duty</option>
                    <option value="on_leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-field-item">
                <label>Assigned Facility</label>
                <input
                  type="text"
                  value={editingStaff.branch}
                  onChange={(e) => setEditingStaff({ ...editingStaff, branch: e.target.value })}
                />
              </div>

              <div className="form-field-item">
                <label>Granular Privileges</label>
                <div className="permissions-checkbox-grid">
                  {[
                    'Check-in/Check-out',
                    'Catalog Management',
                    'Member Registration',
                    'Collect Fines',
                    'Waive Fines (Supervisor)',
                    'Manage Settings & Capacities',
                    'Export Audit Logs',
                  ].map((perm) => (
                    <label key={perm} className="perm-checkbox-item">
                      <input
                        type="checkbox"
                        checked={(editingStaff.permissions || []).includes(perm)}
                        onChange={() => togglePermission(perm, true)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setEditingStaff(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Update Permissions</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </fieldset>
    </div>
  );
}
