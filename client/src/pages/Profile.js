import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
 
function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', zone: '' });
 
  const zones = [
    'Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini',
    'Saket', 'Lajpat Nagar', 'Janakpuri', 'Pitampura',
    'Shahdara', 'Vasant Kunj', 'Mayur Vihar', 'Nehru Place',
    'Chandni Chowk', 'Paharganj', 'Hauz Khas', 'Greater Kailash'
  ];
 
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setForm({ name: user.name, zone: user.zone || '' });
    fetchMyReports();
  }, [user]);
 
  const fetchMyReports = async () => {
    try {
      const res = await API.get('/reports');
      const mine = res.data.filter(r => r.userId?._id === user.id);
      setReports(mine);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };
 
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await API.patch(`/users/${user.id}`, form);
      // Update AuthContext with new user info
      login(
        { ...user, name: res.data.name, zone: res.data.zone },
        localStorage.getItem('token')
      );
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
 
  const stats = {
    total:      reports.length,
    pending:    reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved:   reports.filter(r => r.status === 'resolved').length,
  };
 
  const categoryCount = reports.reduce((acc, r) => {
    const cat = r.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
 
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
 
  const categoryIcon = (cat) => {
    const icons = {
      pothole: '🕳️', garbage: '🗑️', broken_light: '💡',
      waterlogging: '🌊', road_damage: '🚧', fallen_tree: '🌳',
      water_leakage: '💧', sanitation: '🚽', other: '📋'
    };
    return icons[cat] || '📋';
  };
 
  const statusInfo = (status) => {
    if (status === 'resolved')    return { bg: '#f0fdf4', color: '#16a34a', label: '✅ Resolved' };
    if (status === 'in-progress') return { bg: '#fffbeb', color: '#d97706', label: '🔄 In Progress' };
    return { bg: '#fef2f2', color: '#dc2626', label: '⏳ Pending' };
  };
 
  if (!user) return null;
 
  return (
    <div style={styles.page}>
      <Navbar />
 
      <div style={styles.container}>
 
        {/* Profile Card */}
        <div style={styles.profileCard}>
          {/* Avatar */}
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              <span style={styles.avatarLetter}>
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {user.role === 'admin' && (
              <span style={styles.adminBadge}>Admin</span>
            )}
          </div>
 
          {/* Info */}
          {editing ? (
            <div style={styles.editForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                  placeholder="Your full name"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Zone</label>
                <select
                  value={form.zone}
                  onChange={e => setForm({ ...form, zone: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select zone</option>
                  {zones.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div style={styles.editButtons}>
                <button
                  onClick={handleSave}
                  style={saving ? styles.saveBtnDisabled : styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({ name: user.name, zone: user.zone || '' });
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.profileInfo}>
              <h1 style={styles.profileName}>{user.name}</h1>
              <p style={styles.profileEmail}>{user.email}</p>
              <div style={styles.profileMeta}>
                {user.zone && (
                  <span style={styles.metaTag}>📍 {user.zone}</span>
                )}
                <span style={styles.metaTag}>
                  {user.role === 'admin' ? '🛡️ Admin' : '👤 Citizen'}
                </span>
              </div>
              <button
                onClick={() => setEditing(true)}
                style={styles.editBtn}
              >
                ✏️ Edit Profile
              </button>
            </div>
          )}
 
          {/* Points badge */}
          <div style={styles.pointsBadge}>
            <span style={styles.pointsNumber}>{user.points || 0}</span>
            <span style={styles.pointsLabel}>points</span>
          </div>
        </div>
 
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <span style={styles.statNumber}>{stats.total}</span>
            <span style={styles.statLabel}>Total Reports</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⏳</span>
            <span style={{ ...styles.statNumber, color: '#dc2626' }}>
              {stats.pending}
            </span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🔄</span>
            <span style={{ ...styles.statNumber, color: '#d97706' }}>
              {stats.inProgress}
            </span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <span style={{ ...styles.statNumber, color: '#16a34a' }}>
              {stats.resolved}
            </span>
            <span style={styles.statLabel}>Resolved</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🏅</span>
            <span style={{ ...styles.statNumber, color: '#f97316' }}>
              {user.points || 0}
            </span>
            <span style={styles.statLabel}>Points</span>
          </div>
        </div>
 
        {/* Achievement / Top Category */}
        {topCategory && (
          <div style={styles.achievementCard}>
            <span style={{ fontSize: '32px' }}>
              {categoryIcon(topCategory[0])}
            </span>
            <div style={styles.achievementInfo}>
              <p style={styles.achievementTitle}>Your Most Reported Issue</p>
              <p style={styles.achievementValue}>
                {topCategory[0].replace('_', ' ')} — {topCategory[1]} report{topCategory[1] > 1 ? 's' : ''}
              </p>
            </div>
            <div style={styles.achievementBadge}>
              🏆 Active Reporter
            </div>
          </div>
        )}
 
        {/* Recent Reports */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Reports</h2>
            <button
              onClick={() => navigate('/my-complaints')}
              style={styles.viewAllBtn}
            >
              View All →
            </button>
          </div>
 
          {loading ? (
            <div style={styles.loading}>Loading reports...</div>
          ) : reports.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <p style={styles.emptyText}>No reports submitted yet</p>
              <button
                onClick={() => navigate('/report')}
                style={styles.reportBtn}
              >
                Report an Issue
              </button>
            </div>
          ) : (
            <div style={styles.reportsList}>
              {reports.slice(0, 5).map((report, index) => (
                <div key={report._id} style={styles.reportCard}>
                  <div style={styles.reportIcon}>
                    {categoryIcon(report.category)}
                  </div>
                  <div style={styles.reportBody}>
                    <div style={styles.reportTop}>
                      <span style={styles.reportCategory}>
                        {report.category?.replace('_', ' ') || 'Unknown'}
                      </span>
                      <span style={styles.reportSeverity}>
                        {report.severity} severity
                      </span>
                    </div>
                    <p style={styles.reportDesc}>
                      {report.description?.length > 90
                        ? report.description.substring(0, 90) + '...'
                        : report.description}
                    </p>
                    <div style={styles.reportMeta}>
                      <span style={styles.reportZone}>
                        📍 {report.location?.zone || 'Unknown'}
                      </span>
                      <span style={styles.reportDate}>
                        {new Date(report.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusInfo(report.status).bg,
                    color: statusInfo(report.status).color
                  }}>
                    {statusInfo(report.status).label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
 
      </div>
    </div>
  );
}
 
const styles = {
  page: { minHeight: '100vh', background: '#f5f5f4' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
 
  // Profile card
  profileCard: {
    background: '#ffffff', borderRadius: '20px', padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
    display: 'flex', alignItems: 'center', gap: '28px',
    marginBottom: '24px', flexWrap: 'wrap'
  },
  avatarWrapper: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: '88px', height: '88px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #fbbf24)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  avatarLetter: { fontSize: '36px', fontWeight: '800', color: '#ffffff' },
  adminBadge: {
    position: 'absolute', bottom: '0', right: '0',
    background: '#1c1917', color: '#ffffff',
    fontSize: '10px', fontWeight: '700', padding: '2px 7px',
    borderRadius: '10px'
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '26px', fontWeight: '800', color: '#1c1917', marginBottom: '4px' },
  profileEmail: { fontSize: '14px', color: '#78716c', marginBottom: '12px' },
  profileMeta: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' },
  metaTag: {
    padding: '5px 12px', background: '#fff7ed', color: '#f97316',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    border: '1px solid #fed7aa'
  },
  editBtn: {
    padding: '9px 18px', background: '#f97316', color: '#ffffff',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    border: 'none', cursor: 'pointer'
  },
  pointsBadge: {
    background: 'linear-gradient(135deg, #f97316, #fbbf24)',
    borderRadius: '16px', padding: '20px 28px', textAlign: 'center',
    flexShrink: 0
  },
  pointsNumber: { display: 'block', fontSize: '36px', fontWeight: '800', color: '#ffffff' },
  pointsLabel: { fontSize: '13px', color: '#fff7ed', fontWeight: '600' },
 
  // Edit form
  editForm: { flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#1c1917' },
  input: {
    padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e7e5e4', fontSize: '14px',
    color: '#1c1917', background: '#ffffff', fontFamily: 'inherit'
  },
  editButtons: { display: 'flex', gap: '10px' },
  saveBtn: {
    padding: '10px 20px', background: '#f97316', color: '#ffffff',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    border: 'none', cursor: 'pointer'
  },
  saveBtnDisabled: {
    padding: '10px 20px', background: '#fdba74', color: '#ffffff',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    border: 'none', cursor: 'not-allowed'
  },
  cancelBtn: {
    padding: '10px 20px', background: '#f5f5f4', color: '#1c1917',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    border: '1.5px solid #e7e5e4', cursor: 'pointer'
  },
 
  // Stats
  statsRow: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '120px', background: '#ffffff', borderRadius: '14px',
    padding: '18px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
  },
  statIcon: { fontSize: '22px' },
  statNumber: { fontSize: '28px', fontWeight: '800', color: '#1c1917' },
  statLabel: { fontSize: '12px', color: '#78716c', fontWeight: '500' },
 
  // Achievement
  achievementCard: {
    background: 'linear-gradient(135deg, #fff7ed, #fffbeb)',
    border: '1.5px solid #fed7aa', borderRadius: '16px',
    padding: '20px 24px', display: 'flex', alignItems: 'center',
    gap: '16px', marginBottom: '24px'
  },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: '13px', color: '#78716c', marginBottom: '4px' },
  achievementValue: {
    fontSize: '16px', fontWeight: '700', color: '#1c1917',
    textTransform: 'capitalize'
  },
  achievementBadge: {
    padding: '8px 16px', background: '#f97316', color: '#ffffff',
    borderRadius: '20px', fontSize: '13px', fontWeight: '700',
    flexShrink: 0
  },
 
  // Recent reports
  section: {
    background: '#ffffff', borderRadius: '20px', padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4'
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px'
  },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1c1917' },
  viewAllBtn: {
    padding: '8px 16px', background: '#fff7ed', color: '#f97316',
    borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    border: '1px solid #fed7aa', cursor: 'pointer'
  },
  loading: { textAlign: 'center', padding: '40px', color: '#78716c' },
  empty: { textAlign: 'center', padding: '48px' },
  emptyText: { fontSize: '15px', color: '#78716c', margin: '12px 0 20px' },
  reportBtn: {
    padding: '11px 24px', background: '#f97316', color: '#ffffff',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    border: 'none', cursor: 'pointer'
  },
  reportsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reportCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', borderRadius: '12px',
    border: '1px solid #e7e5e4', background: '#fafaf9'
  },
  reportIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: '#fff7ed', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', flexShrink: 0
  },
  reportBody: { flex: 1 },
  reportTop: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' },
  reportCategory: {
    fontSize: '13px', fontWeight: '700',
    color: '#f97316', textTransform: 'capitalize'
  },
  reportSeverity: { fontSize: '12px', color: '#a8a29e' },
  reportDesc: { fontSize: '13px', color: '#1c1917', lineHeight: '1.5', marginBottom: '6px' },
  reportMeta: { display: 'flex', gap: '14px' },
  reportZone: { fontSize: '12px', color: '#78716c' },
  reportDate: { fontSize: '12px', color: '#a8a29e' },
  statusBadge: {
    padding: '6px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', flexShrink: 0,
    whiteSpace: 'nowrap'
  }
};
 
export default Profile;