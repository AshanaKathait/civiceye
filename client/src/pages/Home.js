import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/reports');
        const reports = res.data;
        setStats({
          total: reports.length,
          resolved: reports.filter(r => r.status === 'resolved').length,
          pending: reports.filter(r => r.status === 'pending').length
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>Delhi's Civic Reporting Platform</span>
          <h1 style={styles.heroTitle}>
            See an issue? <br />
            <span style={styles.highlight}>Report it.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            CivicEye empowers Delhi citizens to report civic problems —
            potholes, garbage, broken lights and more — directly to authorities.
          </p>
          <div style={styles.heroButtons}>
            {user ? (
              <button
                onClick={() => navigate('/report')}
                style={styles.primaryBtn}
              >
                Report an Issue
              </button>
            ) : (
              <Link to="/register" style={styles.primaryBtn}>
                Get Started
              </Link>
            )}
            <Link to="/map" style={styles.secondaryBtn}>
              View Map
            </Link>
          </div>
        </div>

        {/* Hero illustration */}
        <div style={styles.heroIllustration}>
          <div style={styles.illustrationCard}>
            <span style={{ fontSize: '64px' }}>🗺️</span>
            <p style={styles.illustrationText}>Live Delhi Heatmap</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>Total Reports</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#f97316' }}>
            {stats.pending}
          </span>
          <span style={styles.statLabel}>Pending</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: '#16a34a' }}>
            {stats.resolved}
          </span>
          <span style={styles.statLabel}>Resolved</span>
        </div>
      </div>

      {/* How it works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepIcon}>📸</span>
            <h3 style={styles.stepTitle}>Snap a photo</h3>
            <p style={styles.stepDesc}>
              Take a photo of the civic issue you see around you
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepIcon}>🤖</span>
            <h3 style={styles.stepTitle}>AI detects it</h3>
            <p style={styles.stepDesc}>
              Our AI automatically identifies the issue type and location
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepIcon}>🏛️</span>
            <h3 style={styles.stepTitle}>Authorities act</h3>
            <p style={styles.stepDesc}>
              Municipal authorities receive and resolve the complaint
            </p>
          </div>
        </div>
      </div>

      {/* Issue Categories */}
      <div style={{ ...styles.section, background: '#fff7ed' }}>
        <h2 style={styles.sectionTitle}>What can you report?</h2>
        <div style={styles.categories}>
          {[
            { icon: '🕳️', label: 'Potholes' },
            { icon: '🗑️', label: 'Garbage' },
            { icon: '💡', label: 'Broken Lights' },
            { icon: '🌊', label: 'Waterlogging' },
            { icon: '🚧', label: 'Road Damage' },
            { icon: '🌳', label: 'Fallen Trees' },
            { icon: '💧', label: 'Water Leakage' },
            { icon: '🚽', label: 'Sanitation' },
          ].map(cat => (
            <div key={cat.label} style={styles.categoryCard}>
              <span style={{ fontSize: '32px' }}>{cat.icon}</span>
              <p style={styles.categoryLabel}>{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to make Delhi better?</h2>
        <p style={styles.ctaSubtitle}>
          Join thousands of citizens already reporting issues
        </p>
        {user ? (
          <button
            onClick={() => navigate('/report')}
            style={styles.ctaBtn}
          >
            Report an Issue Now
          </button>
        ) : (
          <Link to="/register" style={styles.ctaBtn}>
            Join CivicEye
          </Link>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          👁️ CivicEye — Making Delhi better, one report at a time
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f4'
  },
  hero: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px'
  },
  heroContent: {
    flex: 1
  },
  badge: {
    display: 'inline-block',
    background: '#fff7ed',
    color: '#f97316',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid #fed7aa'
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#1c1917',
    lineHeight: '1.1',
    marginBottom: '20px'
  },
  highlight: {
    color: '#f97316'
  },
  heroSubtitle: {
    fontSize: '17px',
    color: '#78716c',
    lineHeight: '1.7',
    marginBottom: '32px',
    maxWidth: '480px'
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  primaryBtn: {
    padding: '14px 28px',
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  secondaryBtn: {
    padding: '14px 28px',
    background: '#ffffff',
    color: '#f97316',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    border: '2px solid #f97316'
  },
  heroIllustration: {
    flex: '0 0 auto'
  },
  illustrationCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(249,115,22,0.15)',
    border: '2px solid #fed7aa'
  },
  illustrationText: {
    marginTop: '12px',
    color: '#f97316',
    fontWeight: '600',
    fontSize: '15px'
  },
  statsSection: {
    maxWidth: '1200px',
    margin: '0 auto 60px',
    padding: '0 20px',
    display: 'flex',
    gap: '20px'
  },
  statCard: {
    flex: 1,
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  statNumber: {
    display: 'block',
    fontSize: '42px',
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: '6px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#78716c',
    fontWeight: '500'
  },
  section: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: '40px',
    textAlign: 'center'
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px'
  },
  step: {
    flex: 1,
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  stepIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '16px'
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: '10px'
  },
  stepDesc: {
    fontSize: '14px',
    color: '#78716c',
    lineHeight: '1.6'
  },
  stepArrow: {
    fontSize: '28px',
    color: '#f97316',
    fontWeight: '700'
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  categoryCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    width: '130px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4',
    cursor: 'pointer'
  },
  categoryLabel: {
    marginTop: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1c1917'
  },
  ctaSection: {
    background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    padding: '80px 20px',
    textAlign: 'center',
    marginTop: '60px'
  },
  ctaTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '12px'
  },
  ctaSubtitle: {
    fontSize: '17px',
    color: '#fff7ed',
    marginBottom: '32px'
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '16px 36px',
    background: '#ffffff',
    color: '#f97316',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: '700',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  footer: {
    background: '#1c1917',
    padding: '24px',
    textAlign: 'center'
  },
  footerText: {
    color: '#a8a29e',
    fontSize: '14px'
  }
};

export default Home;