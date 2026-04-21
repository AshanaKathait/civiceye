import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AllComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    severity: '',
    status: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports');
      setReports(res.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    if (!user) {
      toast.error('Please login to upvote');
      navigate('/login');
      return;
    }
    try {
      const res = await API.patch(`/reports/${id}/upvote`);
      setReports(reports.map(r => r._id === id ? res.data : r));
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const filteredReports = reports.filter(r => {
    return (
      (filter.category === '' || r.category === filter.category) &&
      (filter.severity === '' || r.severity === filter.severity) &&
      (filter.status   === '' || r.status   === filter.status)
    );
  });

  const statusColor = (status) => {
    if (status === 'resolved')    return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'in-progress') return { bg: '#fffbeb', color: '#d97706' };
    return { bg: '#fef2f2', color: '#dc2626' };
  };

  const severityColor = (severity) => {
    if (severity === 'high')   return '#dc2626';
    if (severity === 'medium') return '#d97706';
    return '#16a34a';
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>All Complaints</h1>
          <p style={styles.subtitle}>
            {filteredReports.length} reports found in Delhi
          </p>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            value={filter.category}
            onChange={e => setFilter({ ...filter, category: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="broken_light">Broken Light</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="road_damage">Road Damage</option>
            <option value="fallen_tree">Fallen Tree</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="sanitation">Sanitation</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filter.severity}
            onChange={e => setFilter({ ...filter, severity: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={() => setFilter({ category: '', severity: '', status: '' })}
            style={styles.clearBtn}
          >
            Clear Filters
          </button>
        </div>

        {/* Reports */}
        {loading ? (
          <div style={styles.loading}>Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p>No reports found</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredReports.map(report => (
              <div key={report._id} style={styles.card}>
                {/* Image */}
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    alt="report"
                    style={styles.cardImage}
                  />
                ) : (
                  <div style={styles.cardImagePlaceholder}>
                    <span style={{ fontSize: '40px' }}>
                      {report.category === 'pothole'      && '🕳️'}
                      {report.category === 'garbage'      && '🗑️'}
                      {report.category === 'broken_light' && '💡'}
                      {report.category === 'waterlogging' && '🌊'}
                      {report.category === 'road_damage'  && '🚧'}
                      {report.category === 'fallen_tree'  && '🌳'}
                      {report.category === 'water_leakage'&& '💧'}
                      {report.category === 'sanitation'   && '🚽'}
                      {report.category === 'other'        && '📋'}
                      {!report.category                   && '📋'}
                    </span>
                  </div>
                )}

                <div style={styles.cardBody}>
                  {/* Badges */}
                  <div style={styles.badges}>
                    <span style={{
                      ...styles.badge,
                      background: statusColor(report.status).bg,
                      color: statusColor(report.status).color
                    }}>
                      {report.status}
                    </span>
                    <span style={{
                      ...styles.badge,
                      color: severityColor(report.severity),
                      background: '#f5f5f4'
                    }}>
                      {report.severity} severity
                    </span>
                  </div>

                  {/* Description */}
                  <p style={styles.description}>
                    {report.description?.length > 100
                      ? report.description.substring(0, 100) + '...'
                      : report.description}
                  </p>

                  {/* Location */}
                  <p style={styles.location}>
                    📍 {report.location?.zone || 'Unknown zone'}
                    {report.location?.address &&
                      ` — ${report.location.address.substring(0, 40)}...`}
                  </p>

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <span style={styles.reporter}>
                      👤 {report.userId?.name || 'Anonymous'}
                    </span>
                    <button
                      onClick={() => handleUpvote(report._id)}
                      style={{
                        ...styles.upvoteBtn,
                        background: report.upvotes?.includes(user?.id)
                          ? '#fff7ed'
                          : '#f5f5f4',
                        color: report.upvotes?.includes(user?.id)
                          ? '#f97316'
                          : '#78716c'
                      }}
                    >
                      👍 {report.upvotes?.length || 0}
                    </button>
                  </div>

                  <p style={styles.date}>
                    {new Date(report.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f4' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#1c1917', marginBottom: '6px' },
  subtitle: { fontSize: '15px', color: '#78716c' },
  filters: {
    display: 'flex', gap: '12px', marginBottom: '28px',
    flexWrap: 'wrap', alignItems: 'center'
  },
  filterSelect: {
    padding: '10px 16px', borderRadius: '10px',
    border: '1.5px solid #e7e5e4', fontSize: '14px',
    color: '#1c1917', background: '#ffffff', cursor: 'pointer'
  },
  clearBtn: {
    padding: '10px 16px', borderRadius: '10px',
    border: '1.5px solid #f97316', fontSize: '14px',
    color: '#f97316', background: '#ffffff', cursor: 'pointer',
    fontWeight: '600'
  },
  loading: { textAlign: 'center', padding: '60px', color: '#78716c', fontSize: '16px' },
  empty: { textAlign: 'center', padding: '60px', color: '#78716c' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#ffffff', borderRadius: '16px',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  cardImage: { width: '100%', height: '180px', objectFit: 'cover' },
  cardImagePlaceholder: {
    width: '100%', height: '140px', background: '#fff7ed',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  cardBody: { padding: '16px' },
  badges: { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600'
  },
  description: { fontSize: '14px', color: '#1c1917', lineHeight: '1.6', marginBottom: '10px' },
  location: { fontSize: '13px', color: '#78716c', marginBottom: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reporter: { fontSize: '13px', color: '#78716c' },
  upvoteBtn: {
    padding: '6px 14px', borderRadius: '8px',
    border: '1.5px solid #e7e5e4', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer'
  },
  date: { fontSize: '12px', color: '#a8a29e', marginTop: '8px' }
};

export default AllComplaints;