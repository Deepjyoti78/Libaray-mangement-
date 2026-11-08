import useCollection from '../hooks/useCollection';
import CollectionStatus from '../components/CollectionStatus';
import React, { useState } from 'react';
import { Building2, Plus, MapPin, Clock, Users, CheckCircle2, Edit2, X, Check, Layers } from 'lucide-react';


export default function AdminBranchesPage() {
  const [branches, setBranches, collectionStatus] = useCollection('branches');
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  // New branch form
  const [newBranchForm, setNewBranchForm] = useState({
    name: '',
    japaneseName: '',
    location: '5A, Ring Road, Lajpat Nagar-IV, New Delhi',
    totalSeats: 25,
    hours: 'Tuesday – Saturday: 11:00 AM – 6:30 PM',
    supervisor: 'Staff Duty Officer',
    phone: '+91 11 2644 2967',
    email: 'contact@library.delhi',
    volumesCount: '1,000+ Volumes',
  });

  const totalCapacity = branches.reduce((acc, b) => acc + b.totalSeats, 0);
  const currentOccupancy = branches.reduce((acc, b) => acc + b.currentOccupancy, 0);

  // Add branch
  const handleAddBranch = async (e) => {
    e.preventDefault();
    const created = {
      id: `branch-${Date.now()}`,
      ...newBranchForm,
      totalSeats: parseInt(newBranchForm.totalSeats, 10) || 20,
      currentOccupancy: 0,
      status: 'open',
      amenities: ['High-Speed Wi-Fi', 'Power Outlets', 'Quiet Zone'],
    };
    if (!(await setBranches([...branches, created]))) return;
    setIsAddBranchOpen(false);
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBranch) return;
    if (!(await setBranches(
      branches.map((b) => (b.id === editingBranch.id ? { ...b, ...editingBranch } : b))
    ))) return;
    setEditingBranch(null);
  };

  return (
    <div className="admin-bookings-page admin-branches-page">
      <CollectionStatus {...collectionStatus} />
      <fieldset disabled={collectionStatus.loading || collectionStatus.saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      {/* 1. Page Header */}
      <div className="bookings-header-wrap">
        <div className="bookings-header-titles">
          <span className="bookings-eyebrow">SORA LOCATIONS, READING ROOMS &amp; SPACES</span>
          <h1 className="bookings-main-title">Branches &amp; Facilities Management</h1>
          <p className="bookings-subtitle">
            Configure library branches, reading halls, seating capacities, operating hours, and room amenities.
          </p>
        </div>

        <div className="bookings-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={() => setIsAddBranchOpen(true)}
            title="Add a new library room or branch"
          >
            <Plus size={14} className="pill-cal-icon" />
            <span>Add New Room / Facility</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="bookings-kpi-grid">
        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">ACTIVE SPACES</span>
            <div className="kpi-icon-wrap"><Building2 size={17} /></div>
          </div>
          <div className="kpi-main-number">{branches.length} Facilities</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">All operational</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">TOTAL SEATING CAPACITY</span>
            <div className="kpi-icon-wrap"><Users size={17} /></div>
          </div>
          <div className="kpi-main-number">{totalCapacity} Desks</div>
          <div className="kpi-footer-row">
            <span className="kpi-sub-label">Across Delhi campus</span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">LIVE OCCUPANCY</span>
            <div className="kpi-icon-wrap"><CheckCircle2 size={17} /></div>
          </div>
          <div className="kpi-main-number">{currentOccupancy} / {totalCapacity}</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend neutral">
              {Math.round((currentOccupancy / totalCapacity) * 100)}% utilization
            </span>
          </div>
        </div>

        <div className="bookings-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">SCHEDULED CLOSURES</span>
            <div className="kpi-icon-wrap"><Clock size={17} /></div>
          </div>
          <div className="kpi-main-number">0 This Week</div>
          <div className="kpi-footer-row">
            <span className="kpi-trend positive">Regular schedule active</span>
          </div>
        </div>
      </div>

      {/* 3. Facilities Cards Grid */}
      <div className="branches-cards-grid">
        {branches.map((b) => {
          const occPercent = Math.round((b.currentOccupancy / (b.totalSeats || 1)) * 100);

          return (
            <div key={b.id} className="branch-facility-card">
              <div className="branch-card-header">
                <div className="branch-name-box">
                  <div className="branch-en-title">{b.name}</div>
                  <div className="branch-ja-title">{b.japaneseName}</div>
                </div>
                <span className={`status-pill ${b.status === 'open' ? 'pill-active' : 'pill-amber'}`}>
                  {b.status === 'open' ? 'Open Now' : 'By Appointment'}
                </span>
              </div>

              <div className="branch-location-line">
                <MapPin size={14} className="text-stone-400 flex-shrink-0" />
                <span>{b.location}</span>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="branch-occupancy-box">
                <div className="occupancy-labels">
                  <span className="label-text">Desk Capacity Utilization</span>
                  <strong className="label-val">
                    {b.currentOccupancy} / {b.totalSeats} seats ({occPercent}%)
                  </strong>
                </div>
                <div className="copies-progress-track">
                  <div
                    className={`copies-progress-bar ${occPercent > 80 ? 'bar-amber' : 'bar-green'}`}
                    style={{ width: `${occPercent}%` }}
                  />
                </div>
              </div>

              {/* Info Details */}
              <div className="branch-details-grid">
                <div className="branch-detail-item">
                  <Clock size={13} className="text-stone-400" />
                  <span>{b.hours}</span>
                </div>
                <div className="branch-detail-item">
                  <Users size={13} className="text-stone-400" />
                  <span>Curator: {b.supervisor}</span>
                </div>
                <div className="branch-detail-item">
                  <Layers size={13} className="text-stone-400" />
                  <span>{b.volumesCount}</span>
                </div>
              </div>

              {/* Amenities Chips */}
              <div className="branch-amenities-wrap">
                {(b.amenities || []).map((amenity) => (
                  <span key={amenity} className="amenity-chip">
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="branch-card-footer">
                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={() => setEditingBranch({ ...b })}
                >
                  <Edit2 size={13} />
                  <span>Configure Hall</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. ADD FACILITY MODAL */}
      {isAddBranchOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsAddBranchOpen(false)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">FACILITY ONBOARDING</span>
                <h2 className="dialog-title">Add New Room or Branch</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setIsAddBranchOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Room / Hall Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manga & Anime Studio"
                    value={newBranchForm.name}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Japanese Calligraphy Name</label>
                  <input
                    type="text"
                    placeholder="e.g. マンガ研究スタジオ"
                    value={newBranchForm.japaneseName}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, japaneseName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Total Seating Capacity *</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    required
                    value={newBranchForm.totalSeats}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, totalSeats: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Curator / Supervisor</label>
                  <input
                    type="text"
                    placeholder="e.g. Haruka Sato"
                    value={newBranchForm.supervisor}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, supervisor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-item">
                <label>Location &amp; Floor</label>
                <input
                  type="text"
                  value={newBranchForm.location}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, location: e.target.value })}
                />
              </div>

              <div className="form-field-item">
                <label>Hours of Operation</label>
                <input
                  type="text"
                  value={newBranchForm.hours}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, hours: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setIsAddBranchOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Plus size={15} />
                  <span>Register Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT FACILITY MODAL */}
      {editingBranch && (
        <div className="modal-backdrop-overlay" onClick={() => setEditingBranch(null)}>
          <div className="modal-card-dialog catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-text">
                <span className="dialog-eyebrow">CONFIGURE FACILITY</span>
                <h2 className="dialog-title">{editingBranch.name}</h2>
              </div>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setEditingBranch(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="catalog-modal-form">
              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Room / Hall Name</label>
                  <input
                    type="text"
                    required
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={editingBranch.totalSeats}
                    onChange={(e) => setEditingBranch({ ...editingBranch, totalSeats: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-field-item">
                  <label>Supervisor</label>
                  <input
                    type="text"
                    value={editingBranch.supervisor}
                    onChange={(e) => setEditingBranch({ ...editingBranch, supervisor: e.target.value })}
                  />
                </div>
                <div className="form-field-item">
                  <label>Status</label>
                  <select
                    value={editingBranch.status}
                    onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value })}
                  >
                    <option value="open">Open Now</option>
                    <option value="by_appointment">By Appointment Only</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="dialog-secondary-btn"
                  onClick={() => setEditingBranch(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-primary-btn">
                  <Check size={15} />
                  <span>Update Facility</span>
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
