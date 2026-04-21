import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '' });

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

  const filteredReports = reports.filter(r =>
    r.location?.lat && r.location?.lng &&
    (filter.category === '' || r.category === filter.category) &&
    (filter.status === '' || r.status === filter.status)
  );

  // Zone aggregation
  const zoneCount = reports.reduce((acc, r) => {
    const zone = r.location?.zone || 'Unknown';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(zoneCount), 1);

  // Delhi zones with coordinates
  const delhiZones = [
    { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
    { name: 'Karol Bagh',      lat: 28.6519, lng: 77.1909 },
    { name: 'Dwarka',          lat: 28.5921, lng: 77.0460 },
    { name: 'Rohini',          lat: 28.7358, lng: 77.1067 },
    { name: 'Saket',           lat: 28.5245, lng: 77.2066 },
    { name: 'Lajpat Nagar',    lat: 28.5672, lng: 77.2373 },
    { name: 'Janakpuri',       lat: 28.6286, lng: 77.0830 },
    { name: 'Pitampura',       lat: 28.7008, lng: 77.1311 },
    { name: 'Shahdara',        lat: 28.6726, lng: 77.2944 },
    { name: 'Vasant Kunj',     lat: 28.5200, lng: 77.1577 },
    { name: 'Mayur Vihar',     lat: 28.6096, lng: 77.2952 },
    { name: 'Nehru Place',     lat: 28.5491, lng: 77.2519 },
    { name: 'Chandni Chowk',   lat: 28.6505, lng: 77.2303 },
    { name: 'Paharganj',       lat: 28.6432, lng: 77.2103 },
    { name: 'Hauz Khas',       lat: 28.5494, lng: 77.2001 },
    { name: 'Greater Kailash', lat: 28.5378, lng: 77.2333 },
  ];

  // Heatmap: only show overlay if zone has reports
  // fillOpacity stays very low so map is fully visible underneath
  const getZoneFillOpacity = (zoneName) => {
    const count = zoneCount[zoneName] || 0;
    if (count === 0) return 0; // completely invisible if no reports
    // scale from 0.08 (1 report) to 0.32 (max reports) — always transparent
    return 0.08 + (count / maxCount) * 0.24;
  };

  const getZoneStrokeOpacity = (zoneName) => {
    const count = zoneCount[zoneName] || 0;
    if (count === 0) return 0;
    return 0.15 + (count / maxCount) * 0.25;
  };

  // Radius scales with report count — in metres converted to pixels roughly
  const getZoneRadius = (zoneName) => {
    const count = zoneCount[zoneName] || 0;
    if (count === 0) return 0;
    return 30 + (count / maxCount) * 40; // pixel radius on map
  };

  // Individual marker colours by status
  const getMarkerColor = (status) => {
    if (status === 'resolved')    return '#16a34a';
    if (status === 'in-progress') return '#d97706';
    return '#ef4444';
  };

  // Marker size by severity
  const getMarkerRadius = (severity) => {
    if (severity === 'high')   return 10;
    if (severity === 'medium') return 7;
    return 5;
  };

  const categoryIcon = (cat) => {
    const icons = {
      pothole: '🕳️', garbage: '🗑️', broken_light: '💡',
      waterlogging: '🌊', road_damage: '🚧', fallen_tree: '🌳',
      water_leakage: '💧', sanitation: '🚽', other: '📋'
    };
    return icons[cat] || '📋';
  };

  const statusInfo = (status) => {
    if (status === 'resolved')    return { bg: '#f0fdf4', color: '#16a34a', label: 'Resolved' };
    if (status === 'in-progress') return { bg: '#fffbeb', color: '#d97706', label: 'In Progress' };
    return { bg: '#fef2f2', color: '#ef4444', label: 'Pending' };
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Delhi Civic Heatmap</h1>
          <p style={styles.subtitle}>
            Zones with more reported issues glow orange — hover a marker for details
          </p>
        </div>

        {/* Stats bar */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={{ ...styles.dot, background: '#1c1917' }} />
            <span style={styles.statText}>{reports.length} Total</span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.dot, background: '#ef4444' }} />
            <span style={styles.statText}>
              {reports.filter(r => r.status === 'pending').length} Pending
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.dot, background: '#d97706' }} />
            <span style={styles.statText}>
              {reports.filter(r => r.status === 'in-progress').length} In Progress
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.dot, background: '#16a34a' }} />
            <span style={styles.statText}>
              {reports.filter(r => r.status === 'resolved').length} Resolved
            </span>
          </div>
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
            onClick={() => setFilter({ category: '', status: '' })}
            style={styles.clearBtn}
          >
            Clear Filters
          </button>
        </div>

        {/* Map */}
        <div style={styles.mapWrapper}>
          {loading ? (
            <div style={styles.mapLoading}>Loading map...</div>
          ) : (
            <MapContainer
              center={[28.6139, 77.2090]}
              zoom={11}
              style={{ height: '580px', width: '100%', borderRadius: '14px' }}
            >
              {/* Clean light tile layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Zone heatmap overlays — very transparent so map shows through */}
              {delhiZones.map(zone => {
                const opacity = getZoneFillOpacity(zone.name);
                if (opacity === 0) return null;
                return (
                  <CircleMarker
                    key={`zone-${zone.name}`}
                    center={[zone.lat, zone.lng]}
                    radius={getZoneRadius(zone.name)}
                    pathOptions={{
                      fillColor: '#f97316',
                      fillOpacity: opacity,
                      color: '#f97316',
                      weight: 1,
                      opacity: getZoneStrokeOpacity(zone.name)
                    }}
                  >
                    <Popup>
                      <div style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                          {zone.name}
                        </p>
                        <p style={{ color: '#f97316', fontWeight: '700', fontSize: '16px' }}>
                          {zoneCount[zone.name] || 0} report{zoneCount[zone.name] !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Individual report markers — small, crisp dots */}
              {filteredReports.map(report => (
                <CircleMarker
                  key={report._id}
                  center={[report.location.lat, report.location.lng]}
                  radius={getMarkerRadius(report.severity)}
                  pathOptions={{
                    fillColor: getMarkerColor(report.status),
                    fillOpacity: 0.9,
                    color: '#ffffff',
                    weight: 1.5
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '190px', padding: '4px' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                        {categoryIcon(report.category)}{' '}
                        {report.category?.replace('_', ' ') || 'Issue'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: '1.5' }}>
                        {report.description?.substring(0, 90)}
                        {report.description?.length > 90 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                          background: statusInfo(report.status).bg,
                          color: statusInfo(report.status).color
                        }}>
                          {statusInfo(report.status).label}
                        </span>
                        <span style={{
                          padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                          background: '#fff7ed', color: '#f97316'
                        }}>
                          {report.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
                        📍 {report.location?.zone || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#888' }}>
                        👤 {report.userId?.name || 'Anonymous'}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendGroup}>
            <span style={styles.legendGroupTitle}>Marker Status</span>
            <div style={styles.legendItems}>
              {[
                { color: '#ef4444', label: 'Pending' },
                { color: '#d97706', label: 'In Progress' },
                { color: '#16a34a', label: 'Resolved' },
              ].map(item => (
                <div key={item.label} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: item.color }} />
                  <span style={styles.legendLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.legendDivider} />

          <div style={styles.legendGroup}>
            <span style={styles.legendGroupTitle}>Marker Size = Severity</span>
            <div style={styles.legendItems}>
              {[
                { size: 18, label: 'High' },
                { size: 13, label: 'Medium' },
                { size: 9,  label: 'Low' },
              ].map(item => (
                <div key={item.label} style={styles.legendItem}>
                  <span style={{
                    width: `${item.size}px`, height: `${item.size}px`,
                    borderRadius: '50%', background: '#9ca3af',
                    display: 'inline-block', flexShrink: 0
                  }} />
                  <span style={styles.legendLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.legendDivider} />

          <div style={styles.legendGroup}>
            <span style={styles.legendGroupTitle}>Zone Heatmap</span>
            <div style={styles.legendItems}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: '#f97316', opacity: 0.55 }} />
                <span style={styles.legendLabel}>Many issues</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: '#f97316', opacity: 0.15 }} />
                <span style={styles.legendLabel}>Few issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone breakdown */}
        {Object.keys(zoneCount).length > 0 && (
          <div style={styles.zoneCard}>
            <h3 style={styles.zoneTitle}>Zone Breakdown</h3>
            <div style={styles.zoneList}>
              {delhiZones
                .filter(z => zoneCount[z.name])
                .sort((a, b) => (zoneCount[b.name] || 0) - (zoneCount[a.name] || 0))
                .map(zone => (
                  <div key={zone.name} style={styles.zoneRow}>
                    <span style={styles.zoneName}>{zone.name}</span>
                    <div style={styles.zoneBarTrack}>
                      <div style={{
                        ...styles.zoneBarFill,
                        width: `${((zoneCount[zone.name] || 0) / maxCount) * 100}%`
                      }} />
                    </div>
                    <span style={styles.zoneCount}>
                      {zoneCount[zone.name]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f4' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },

  header: { marginBottom: '18px' },
  title: { fontSize: '30px', fontWeight: '800', color: '#1c1917', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: '#78716c' },

  statsBar: {
    display: 'flex', gap: '24px', background: '#ffffff',
    padding: '13px 20px', borderRadius: '12px',
    border: '1px solid #e7e5e4', marginBottom: '14px',
    flexWrap: 'wrap', alignItems: 'center'
  },
  statItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  statText: { fontSize: '14px', fontWeight: '600', color: '#1c1917' },

  filters: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
  filterSelect: {
    padding: '9px 14px', borderRadius: '10px',
    border: '1.5px solid #e7e5e4', fontSize: '14px',
    color: '#1c1917', background: '#ffffff', cursor: 'pointer'
  },
  clearBtn: {
    padding: '9px 16px', borderRadius: '10px',
    border: '1.5px solid #f97316', fontSize: '14px',
    color: '#f97316', background: '#ffffff', cursor: 'pointer', fontWeight: '600'
  },

  mapWrapper: {
    borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '16px', border: '1.5px solid #e7e5e4'
  },
  mapLoading: {
    height: '580px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#ffffff',
    fontSize: '16px', color: '#78716c'
  },

  legend: {
    display: 'flex', gap: '0', background: '#ffffff',
    borderRadius: '12px', border: '1px solid #e7e5e4',
    marginBottom: '16px', flexWrap: 'wrap', overflow: 'hidden'
  },
  legendGroup: { padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  legendGroupTitle: { fontSize: '12px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px' },
  legendItems: { display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  legendLabel: { fontSize: '13px', color: '#1c1917' },
  legendDivider: { width: '1px', background: '#e7e5e4', margin: '12px 0' },

  zoneCard: {
    background: '#ffffff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4'
  },
  zoneTitle: { fontSize: '17px', fontWeight: '700', color: '#1c1917', marginBottom: '16px' },
  zoneList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  zoneRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  zoneName: { fontSize: '13px', fontWeight: '500', color: '#1c1917', width: '140px', flexShrink: 0 },
  zoneBarTrack: { flex: 1, height: '7px', background: '#f5f5f4', borderRadius: '4px', overflow: 'hidden' },
  zoneBarFill: { height: '100%', background: '#f97316', borderRadius: '4px' },
  zoneCount: { fontSize: '13px', fontWeight: '700', color: '#f97316', width: '24px', textAlign: 'right' }
};

export default Map;