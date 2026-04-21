import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyReports();
  // eslint-disable-next-line
  }, [user]);

  const fetchMyReports = async () => {
    try {
      const res = await API.get('/reports');
      const myReports = res.data.filter(r => r.userId?._id === user.id);
      setReports(myReports);
    } catch (err) {
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'resolved')    return { bg: '#f0fdf4', color: '#16a34a', label: '✅ Resolved' };
    if (status === 'in-progress') return { bg: '#fffbeb', color: '#d97706', label: '🔄 In Progress' };
    return { bg: '#fef2f2', color: '#dc2626', label: '⏳ Pending' };
  };

  const severityColor = (severity) => {
    if (severity === 'high')   return '#dc2626';
    if (severity === 'medium') return '#d97706';
    return '#16a34a';
  };

  const stats = {
    total:      reports.length,
    pending:    reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved:   reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Complaints</h1>
          <p style={styles.subtitle}>Track all your reported issues</p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.total}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNumber, color: '#dc2626' }}>
              {stats.pending}
            </span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNumber, color: '#d97706' }}>
              {stats.inProgress}
            </span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statNumber, color: '#16a34a' }}>
              {stats.resolved}
            </span>
            <span style={styles.statLabel}>Resolved</span>
          </div>
        </div>

        {/* Reports */}
        {loading ? (
          <div style={styles.loading}>Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: '64px' }}>📭</span>
            <h3 style={styles.emptyTitle}>No reports yet</h3>
            <p style={styles.emptySubtitle}>
              You haven't reported any issues yet
            </p>
            <button
              onClick={() => navigate('/report')}
              style={styles.reportBtn}
            >
              Report an Issue
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {reports.map((report, index) => (
              <div key={report._id} style={styles.card}>
                {/* Left — number */}
                <div style={styles.cardNumber}>
                  <span style={styles.numberText}>#{index + 1}</span>
                </div>

                {/* Middle — details */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.category}>
                      {report.category?.replace('_', ' ') || 'Unknown'}
                    </span>
                    <span style={{
                      ...styles.severityBadge,
                      color: severityColor(report.severity)
                    }}>
                      {report.severity} severity
                    </span>
                  </div>

                  <p style={styles.description}>
                    {report.description?.length > 120
                      ? report.description.substring(0, 120) + '...'
                      : report.description}
                  </p>

                  <div style={styles.cardMeta}>
                    <span style={styles.zone}>
                      📍 {report.location?.zone || 'Unknown'}
                    </span>
                    <span style={styles.date}>
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span style={styles.upvotes}>
                      👍 {report.upvotes?.length || 0} upvotes
                    </span>
                  </div>
                </div>

                {/* Right — status */}
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusColor(report.status).bg,
                    color: statusColor(report.status).color
                  }}>
                    {statusColor(report.status).label}
                  </span>
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
  container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#1c1917', marginBottom: '6px' },
  subtitle: { fontSize: '15px', color: '#78716c' },
  statsRow: {
    display: 'flex', gap: '16px', marginBottom: '32px'
  },
  statCard: {
    flex: 1, background: '#ffffff', borderRadius: '14px',
    padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  statNumber: {
    display: 'block', fontSize: '32px',
    fontWeight: '800', color: '#1c1917', marginBottom: '4px'
  },
  statLabel: { fontSize: '13px', color: '#78716c', fontWeight: '500' },
  loading: { textAlign: 'center', padding: '60px', color: '#78716c' },
  empty: {
    textAlign: 'center', padding: '80px 20px',
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #e7e5e4'
  },
  emptyTitle: { fontSize: '22px', fontWeight: '700', color: '#1c1917', marginTop: '16px' },
  emptySubtitle: { fontSize: '15px', color: '#78716c', marginTop: '8px', marginBottom: '24px' },
  reportBtn: {
    padding: '12px 28px', background: '#f97316',
    color: '#ffffff', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', border: 'none', cursor: 'pointer'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: {
    background: '#ffffff', borderRadius: '14px',
    padding: '20px', display: 'flex', gap: '16px',
    alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  cardNumber: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: '#fff7ed', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  numberText: { fontSize: '13px', fontWeight: '700', color: '#f97316' },
  cardBody: { flex: 1 },
  cardTop: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' },
  category: {
    fontSize: '13px', fontWeight: '700',
    color: '#f97316', textTransform: 'capitalize'
  },
  severityBadge: { fontSize: '12px', fontWeight: '500' },
  description: {
    fontSize: '14px', color: '#1c1917',
    lineHeight: '1.6', marginBottom: '10px'
  },
  cardMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  zone: { fontSize: '13px', color: '#78716c' },
  date: { fontSize: '13px', color: '#a8a29e' },
  upvotes: { fontSize: '13px', color: '#78716c' },
  cardRight: { flexShrink: 0 },
  statusBadge: {
    padding: '8px 14px', borderRadius: '20px',
    fontSize: '13px', fontWeight: '600',
    whiteSpace: 'nowrap'
  }
};

export default MyComplaints;