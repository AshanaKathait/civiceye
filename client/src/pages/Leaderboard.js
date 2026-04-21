import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from 'recharts';

function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadersRes, reportsRes] = await Promise.all([
        API.get('/leaderboard'),
        API.get('/reports')
      ]);
      setLeaders(leadersRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  // Chart data — top 5 reporters by points
  const barData = leaders.slice(0, 5).map(l => ({
    name: l.name.split(' ')[0],
    points: l.points
  }));

  // Category breakdown from reports
  const categoryCount = reports.reduce((acc, r) => {
    const cat = r.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  const PIE_COLORS = ['#f97316', '#fbbf24', '#fb923c', '#fdba74', '#fed7aa', '#ea580c', '#c2410c', '#9a3412'];

  // Zone breakdown
  const zoneCount = reports.reduce((acc, r) => {
    const zone = r.location?.zone || 'Unknown';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const zoneData = Object.entries(zoneCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([zone, count]) => ({ zone, count }));

  // Status breakdown
  const statusData = [
    { name: 'Pending',     value: reports.filter(r => r.status === 'pending').length,     color: '#dc2626' },
    { name: 'In Progress', value: reports.filter(r => r.status === 'in-progress').length, color: '#d97706' },
    { name: 'Resolved',    value: reports.filter(r => r.status === 'resolved').length,    color: '#16a34a' },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.loading}>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Leaderboard</h1>
          <p style={styles.subtitle}>Top citizens making Delhi better</p>
        </div>

        {/* Summary stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <span style={styles.statNumber}>{leaders.length}</span>
            <span style={styles.statLabel}>Active Citizens</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <span style={styles.statNumber}>{reports.length}</span>
            <span style={styles.statLabel}>Total Reports</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <span style={{ ...styles.statNumber, color: '#16a34a' }}>
              {reports.filter(r => r.status === 'resolved').length}
            </span>
            <span style={styles.statLabel}>Resolved</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🏅</span>
            <span style={{ ...styles.statNumber, color: '#f97316' }}>
              {leaders[0]?.points || 0}
            </span>
            <span style={styles.statLabel}>Top Score</span>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaders.length >= 1 && (
          <div style={styles.podiumSection}>
            <h2 style={styles.sectionTitle}>Top Reporters</h2>
            <div style={styles.podium}>
              {/* 2nd */}
              {leaders[1] && (
                <div style={styles.podiumCard}>
                  <span style={styles.podiumMedal}>🥈</span>
                  <div style={{ ...styles.podiumAvatar, background: '#d1d5db' }}>
                    {leaders[1].name?.charAt(0).toUpperCase()}
                  </div>
                  <p style={styles.podiumName}>{leaders[1].name}</p>
                  <p style={styles.podiumZone}>{leaders[1].zone || 'Delhi'}</p>
                  <div style={{ ...styles.podiumBase, height: '70px', background: '#9ca3af' }}>
                    <span style={styles.podiumPoints}>{leaders[1].points} pts</span>
                  </div>
                </div>
              )}

              {/* 1st */}
              <div style={styles.podiumCard}>
                <span style={{ fontSize: '40px' }}>🥇</span>
                <div style={{ ...styles.podiumAvatar, background: '#f97316', width: '68px', height: '68px', fontSize: '26px', color: '#fff' }}>
                  {leaders[0].name?.charAt(0).toUpperCase()}
                </div>
                <p style={{ ...styles.podiumName, fontSize: '17px', color: '#f97316' }}>
                  {leaders[0].name}
                </p>
                <p style={styles.podiumZone}>{leaders[0].zone || 'Delhi'}</p>
                <div style={{ ...styles.podiumBase, height: '100px', background: '#f97316' }}>
                  <span style={styles.podiumPoints}>{leaders[0].points} pts</span>
                </div>
              </div>

              {/* 3rd */}
              {leaders[2] && (
                <div style={styles.podiumCard}>
                  <span style={styles.podiumMedal}>🥉</span>
                  <div style={{ ...styles.podiumAvatar, background: '#fed7aa' }}>
                    {leaders[2].name?.charAt(0).toUpperCase()}
                  </div>
                  <p style={styles.podiumName}>{leaders[2].name}</p>
                  <p style={styles.podiumZone}>{leaders[2].zone || 'Delhi'}</p>
                  <div style={{ ...styles.podiumBase, height: '50px', background: '#fb923c' }}>
                    <span style={styles.podiumPoints}>{leaders[2].points} pts</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div style={styles.chartsRow}>

          {/* Bar chart — top reporters */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Top 5 Reporters</h3>
            {barData.length === 0 ? (
              <div style={styles.noData}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e7e5e4' }}
                  />
                  <Bar dataKey="points" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — issue categories */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Issues by Category</h3>
            {pieData.length === 0 ? (
              <div style={styles.noData}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e7e5e4' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Second charts row */}
        <div style={styles.chartsRow}>

          {/* Zone bar chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Reports by Zone</h3>
            {zoneData.length === 0 ? (
              <div style={styles.noData}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={zoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e7e5e4' }}
                  />
                  <Bar dataKey="count" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status pie chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Report Status</h3>
            {reports.length === 0 ? (
              <div style={styles.noData}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e7e5e4' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Full Rankings List */}
        <div style={styles.rankingCard}>
          <h2 style={styles.sectionTitle}>All Rankings</h2>
          {leaders.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: '48px' }}>🏆</span>
              <p style={{ color: '#78716c', marginTop: '12px' }}>
                No rankings yet — be the first to report!
              </p>
            </div>
          ) : (
            <div style={styles.list}>
              {leaders.map((leader, index) => (
                <div
                  key={leader._id}
                  style={{
                    ...styles.rankCard,
                    ...(index === 0 ? styles.rankFirst : {}),
                    ...(user?.id === leader._id ? styles.rankMe : {})
                  }}
                >
                  <span style={styles.rankMedal}>{getMedal(index)}</span>

                  <div style={{
                    ...styles.avatar,
                    background: index === 0 ? '#f97316' : '#e7e5e4',
                    color: index === 0 ? '#ffffff' : '#1c1917'
                  }}>
                    {leader.name?.charAt(0).toUpperCase()}
                  </div>

                  <div style={styles.rankInfo}>
                    <div style={styles.rankNameRow}>
                      <span style={styles.rankName}>{leader.name}</span>
                      {user?.id === leader._id && (
                        <span style={styles.youBadge}>You</span>
                      )}
                    </div>
                    <span style={styles.rankZone}>
                      📍 {leader.zone || 'Delhi'}
                    </span>
                  </div>

                  <div style={styles.rankPoints}>
                    <span style={styles.pointsNum}>{leader.points}</span>
                    <span style={styles.pointsLabel}>pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to earn */}
        <div style={styles.earnCard}>
          <h3 style={styles.chartTitle}>How to earn points</h3>
          <div style={styles.earnGrid}>
            {[
              { icon: '📝', label: 'Submit a report', points: '+10 pts' },
              { icon: '✅', label: 'Report resolved', points: '+20 pts' },
              { icon: '👍', label: 'Get an upvote',   points: '+5 pts'  },
            ].map(item => (
              <div key={item.label} style={styles.earnItem}>
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                <p style={styles.earnLabel}>{item.label}</p>
                <p style={styles.earnPoints}>{item.points}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f4' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  loading: { textAlign: 'center', padding: '100px', fontSize: '16px', color: '#78716c' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '800', color: '#1c1917', marginBottom: '8px' },
  subtitle: { fontSize: '16px', color: '#78716c' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '140px', background: '#ffffff',
    borderRadius: '16px', padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
  },
  statIcon: { fontSize: '24px' },
  statNumber: { fontSize: '32px', fontWeight: '800', color: '#1c1917' },
  statLabel: { fontSize: '13px', color: '#78716c', fontWeight: '500' },
  podiumSection: {
    background: '#ffffff', borderRadius: '20px', padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
    marginBottom: '20px'
  },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#1c1917', marginBottom: '24px' },
  podium: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px' },
  podiumCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' },
  podiumMedal: { fontSize: '32px', marginBottom: '8px' },
  podiumAvatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '700', color: '#1c1917', marginBottom: '8px'
  },
  podiumName: { fontSize: '14px', fontWeight: '700', color: '#1c1917', textAlign: 'center', marginBottom: '4px' },
  podiumZone: { fontSize: '12px', color: '#78716c', marginBottom: '8px', textAlign: 'center' },
  podiumBase: {
    width: '100%', borderRadius: '8px 8px 0 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  podiumPoints: { fontSize: '13px', fontWeight: '700', color: '#ffffff' },
  chartsRow: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
  chartCard: {
    flex: 1, minWidth: '280px', background: '#ffffff',
    borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4'
  },
  chartTitle: { fontSize: '16px', fontWeight: '700', color: '#1c1917', marginBottom: '16px' },
  noData: { textAlign: 'center', padding: '60px', color: '#a8a29e', fontSize: '14px' },
  rankingCard: {
    background: '#ffffff', borderRadius: '20px', padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
    marginBottom: '20px'
  },
  empty: { textAlign: 'center', padding: '40px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  rankCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px', borderRadius: '12px',
    border: '1px solid #e7e5e4', background: '#ffffff'
  },
  rankFirst: { border: '2px solid #f97316', background: '#fff7ed' },
  rankMe: { border: '2px solid #fbbf24', background: '#fffbeb' },
  rankMedal: { fontSize: '20px', width: '32px', textAlign: 'center', flexShrink: 0 },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', flexShrink: 0
  },
  rankInfo: { flex: 1 },
  rankNameRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' },
  rankName: { fontSize: '15px', fontWeight: '700', color: '#1c1917' },
  youBadge: {
    padding: '2px 8px', background: '#f97316',
    color: '#ffffff', borderRadius: '10px', fontSize: '11px', fontWeight: '700'
  },
  rankZone: { fontSize: '13px', color: '#78716c' },
  rankPoints: { textAlign: 'right', flexShrink: 0 },
  pointsNum: { display: 'block', fontSize: '22px', fontWeight: '800', color: '#f97316' },
  pointsLabel: { fontSize: '12px', color: '#78716c' },
  earnCard: {
    background: '#ffffff', borderRadius: '20px', padding: '28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4'
  },
  earnGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  earnItem: {
    flex: 1, minWidth: '140px', textAlign: 'center',
    padding: '20px', background: '#fff7ed',
    borderRadius: '12px', border: '1px solid #fed7aa'
  },
  earnLabel: { fontSize: '13px', color: '#78716c', marginTop: '8px', marginBottom: '4px' },
  earnPoints: { fontSize: '16px', fontWeight: '700', color: '#f97316' }
};

export default Leaderboard;
