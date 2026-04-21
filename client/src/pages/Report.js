import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [form, setForm] = useState({
    description: '',
    category: '',
    severity: 'medium',
    location: {
      lat: '',
      lng: '',
      zone: '',
      address: ''
    }
  });

  const categories = [
    { value: 'pothole',        label: '🕳️ Pothole' },
    { value: 'garbage',        label: '🗑️ Garbage' },
    { value: 'broken_light',   label: '💡 Broken Light' },
    { value: 'waterlogging',   label: '🌊 Waterlogging' },
    { value: 'road_damage',    label: '🚧 Road Damage' },
    { value: 'fallen_tree',    label: '🌳 Fallen Tree' },
    { value: 'water_leakage',  label: '💧 Water Leakage' },
    { value: 'sanitation',     label: '🚽 Sanitation' },
    { value: 'other',          label: '📋 Other' },
  ];

  const zones = [
    'Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini',
    'Saket', 'Lajpat Nagar', 'Janakpuri', 'Pitampura',
    'Shahdara', 'Vasant Kunj', 'Mayur Vihar', 'Nehru Place',
    'Chandni Chowk', 'Paharganj', 'Hauz Khas', 'Greater Kailash'
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    setForm({
      ...form,
      location: { ...form.location, [e.target.name]: e.target.value }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const detectLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name || '';
          const zone = data.address?.suburb ||
                       data.address?.neighbourhood ||
                       data.address?.city_district || '';
          setForm(prev => ({
            ...prev,
            location: {
              lat: latitude,
              lng: longitude,
              address: address,
              zone: zone
            }
          }));
          toast.success('Location detected!');
        } catch {
          setForm(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              lng: longitude
            }
          }));
          toast.success('Coordinates detected!');
        }
        setLocationLoading(false);
      },
      () => {
        toast.error('Could not detect location');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.location.zone) {
      toast.error('Please select or detect your zone');
      return;
    }

    setLoading(true);
    try {
      await API.post('/reports', form);
      toast.success('Report submitted successfully! 🎉');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Report an Issue</h1>
          <p style={styles.subtitle}>
            Help make Delhi better by reporting civic problems in your area
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Image Upload */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📸 Upload Photo</h3>
            <div
              style={styles.imageUpload}
              onClick={() => document.getElementById('imageInput').click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  style={styles.imagePreview}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span style={{ fontSize: '48px' }}>📷</span>
                  <p style={styles.imagePlaceholderText}>
                    Click to upload a photo of the issue
                  </p>
                  <p style={styles.imagePlaceholderSub}>
                    JPG, PNG up to 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Category */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🏷️ Issue Category</h3>
            <div style={styles.categoryGrid}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  style={
                    form.category === cat.value
                      ? styles.categoryBtnActive
                      : styles.categoryBtn
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📝 Description</h3>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail... (e.g. Large pothole near the bus stop, causing accidents)"
              style={styles.textarea}
              rows={4}
              required
            />
          </div>

          {/* Severity */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚠️ Severity</h3>
            <div style={styles.severityRow}>
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, severity: level })}
                  style={
                    form.severity === level
                      ? { ...styles.severityBtn, ...styles[`severity_${level}`] }
                      : styles.severityBtn
                  }
                >
                  {level === 'low' && '🟢 Low'}
                  {level === 'medium' && '🟡 Medium'}
                  {level === 'high' && '🔴 High'}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📍 Location</h3>

            <button
              type="button"
              onClick={detectLocation}
              style={styles.detectBtn}
              disabled={locationLoading}
            >
              {locationLoading ? '📍 Detecting...' : '📍 Detect My Location'}
            </button>

            {form.location.lat && (
              <p style={styles.coordText}>
                ✅ Coordinates: {Number(form.location.lat).toFixed(4)},{' '}
                {Number(form.location.lng).toFixed(4)}
              </p>
            )}

            {form.location.address && (
              <p style={styles.addressText}>
                📍 {form.location.address}
              </p>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Zone / Area</label>
              <select
                name="zone"
                value={form.location.zone}
                onChange={handleLocationChange}
                style={styles.input}
                required
              >
                <option value="">Select zone</option>
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Address (optional)</label>
              <input
                type="text"
                name="address"
                value={form.location.address}
                onChange={handleLocationChange}
                placeholder="e.g. Near Karol Bagh Metro Station"
                style={styles.input}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={loading ? styles.submitBtnDisabled : styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Report 🚀'}
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f4'
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#78716c'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e7e5e4'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: '16px'
  },
  imageUpload: {
    border: '2px dashed #f97316',
    borderRadius: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
    minHeight: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagePreview: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    textAlign: 'center',
    padding: '32px'
  },
  imagePlaceholderText: {
    fontSize: '15px',
    color: '#78716c',
    marginTop: '12px',
    fontWeight: '500'
  },
  imagePlaceholderSub: {
    fontSize: '13px',
    color: '#a8a29e',
    marginTop: '4px'
  },
  categoryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  categoryBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e7e5e4',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1c1917',
    cursor: 'pointer'
  },
  categoryBtnActive: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1.5px solid #f97316',
    background: '#fff7ed',
    fontSize: '14px',
    fontWeight: '600',
    color: '#f97316',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e7e5e4',
    fontSize: '15px',
    color: '#1c1917',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  severityRow: {
    display: 'flex',
    gap: '12px'
  },
  severityBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1.5px solid #e7e5e4',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1c1917',
    cursor: 'pointer'
  },
  severity_low: {
    border: '1.5px solid #16a34a',
    background: '#f0fdf4',
    color: '#16a34a'
  },
  severity_medium: {
    border: '1.5px solid #fbbf24',
    background: '#fffbeb',
    color: '#d97706'
  },
  severity_high: {
    border: '1.5px solid #dc2626',
    background: '#fef2f2',
    color: '#dc2626'
  },
  detectBtn: {
    padding: '12px 20px',
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '12px'
  },
  coordText: {
    fontSize: '13px',
    color: '#16a34a',
    marginBottom: '8px',
    fontWeight: '500'
  },
  addressText: {
    fontSize: '13px',
    color: '#78716c',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px'
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
    background: '#ffffff',
    fontFamily: 'inherit'
  },
  submitBtn: {
    padding: '16px',
    background: '#f97316',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer'
  },
  submitBtnDisabled: {
    padding: '16px',
    background: '#fdba74',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: '700',
    border: 'none',
    cursor: 'not-allowed'
  }
};

export default Report;