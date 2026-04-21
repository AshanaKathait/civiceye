import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    zone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const zones = [
    'Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini',
    'Saket', 'Lajpat Nagar', 'Janakpuri', 'Pitampura',
    'Shahdara', 'Vasant Kunj', 'Mayur Vihar', 'Nehru Place'
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>👁️</span>
          <h1 style={styles.logoText}>CivicEye</h1>
        </div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join thousands reporting civic issues</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Zone in Delhi</label>
            <select
              name="zone"
              value={form.zone}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select your zone</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px'
  },
  logoIcon: { fontSize: '32px' },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f97316'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: '6px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#78716c',
    marginBottom: '28px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1c1917'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e7e5e4',
    fontSize: '15px',
    color: '#1c1917',
    background: '#ffffff'
  },
  button: {
    padding: '14px',
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '6px'
  },
  buttonDisabled: {
    padding: '14px',
    background: '#fdba74',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '6px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#78716c'
  },
  link: {
    color: '#f97316',
    fontWeight: '600'
  }
};

export default Register;
