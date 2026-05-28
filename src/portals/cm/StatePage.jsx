import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const districtData = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, open: 18, status: 'critical' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, open: 13, status: 'critical' },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198, open: 9, status: 'medium' },
  { name: 'Salem', lat: 11.6643, lng: 78.1460, open: 15, status: 'critical' },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, open: 7, status: 'medium' },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, open: 4, status: 'low' },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325, open: 10, status: 'medium' },
  { name: 'Erode', lat: 11.3410, lng: 77.7172, open: 12, status: 'critical' },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, open: 3, status: 'low' },
  { name: 'Dindigul', lat: 10.3673, lng: 77.9803, open: 7, status: 'medium' },
  { name: 'Kancheepuram', lat: 12.8333, lng: 79.7000, open: 5, status: 'low' },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7714, open: 14, status: 'critical' },
  { name: 'Namakkal', lat: 11.2189, lng: 78.1674, open: 9, status: 'medium' },
  { name: 'Nilgiris', lat: 11.4916, lng: 76.7337, open: 20, status: 'critical' },
  { name: 'Ariyalur', lat: 11.1404, lng: 79.0756, open: 6, status: 'medium' },
];

const sectorData = [
  { name: 'Roads', count: 187, color: '#f97316', pct: 27 },
  { name: 'Water', count: 143, color: '#3b82f6', pct: 21 },
  { name: 'Electricity', count: 98, color: '#eab308', pct: 14 },
  { name: 'Health', count: 76, color: '#ef4444', pct: 11 },
  { name: 'Education', count: 54, color: '#8b5cf6', pct: 8 },
  { name: 'Agriculture', count: 122, color: '#22c55e', pct: 18 },
];

const getColor = (status) => {
  if (status === 'critical') return '#ef4444';
  if (status === 'medium') return '#f97316';
  return '#22c55e';
};

const getRadius = (open) => Math.max(8, open * 0.6);

export default function StatePage() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const totalOpen = districtData.reduce((s, d) => s + d.open, 0);
  const critical = districtData.filter(d => d.status === 'critical').length;
  const resolved = 1856;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', background: '#f5f0eb',
      paddingBottom: '80px', overflowY: 'auto'
    }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #1e3a5f 100%)',
        padding: '20px 16px 24px', color: 'white'
      }}>
        <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '4px', letterSpacing: '1px' }}>
          TAMIL NADU STATE OVERVIEW
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
          38-District Grievance Command
        </div>

        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Total Open', value: totalOpen, color: '#fca5a5' },
            { label: 'Critical Districts', value: critical, color: '#fcd34d' },
            { label: 'Resolved This Month', value: resolved, color: '#86efac' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '12px 8px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{
        display: 'flex', background: 'white',
        margin: '16px', borderRadius: '12px',
        padding: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        {['map', 'grid', 'sectors'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
            borderRadius: '9px', fontSize: '12px', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            background: activeTab === tab ? '#7f1d1d' : 'transparent',
            color: activeTab === tab ? 'white' : '#6b7280',
            transition: 'all 0.2s'
          }}>
            {tab === 'map' ? '🗺 Map' : tab === 'grid' ? '⊞ Grid' : '📊 Sectors'}
          </button>
        ))}
      </div>

      {/* MAP VIEW */}
      {activeTab === 'map' && (
        <div style={{ margin: '0 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Live ticket heatmap — tap any district
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {[['critical','#ef4444','>15'],['medium','#f97316','6-15'],['low','#22c55e','<6']].map(([s,c,r])=>(
              <span key={s} style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                background: c+'20', color: c, fontWeight: '600', border: `1px solid ${c}40`
              }}>● {s.charAt(0).toUpperCase()+s.slice(1)} ({r})</span>
            ))}
          </div>

          {/* MAP */}
          <div style={{
            height: '320px', borderRadius: '16px',
            overflow: 'hidden', position: 'relative', zIndex: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
          }}>
            <MapContainer
              center={[10.8505, 78.6677]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="© Carto"
              />
              {districtData.map((d, i) => (
                <CircleMarker
                  key={i}
                  center={[d.lat, d.lng]}
                  radius={getRadius(d.open)}
                  fillColor={getColor(d.status)}
                  color="white"
                  weight={2}
                  fillOpacity={0.85}
                  eventHandlers={{ click: () => setSelectedDistrict(d) }}
                >
                  <Popup>
                    <strong>{d.name}</strong><br/>
                    Open: {d.open} tickets<br/>
                    Status: {d.status}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* Selected District Card */}
          {selectedDistrict && (
            <div style={{
              marginTop: '12px', background: 'white',
              borderRadius: '12px', padding: '14px',
              borderLeft: `4px solid ${getColor(selectedDistrict.status)}`
            }}>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedDistrict.name} District</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {selectedDistrict.open} open tickets •
                <span style={{ color: getColor(selectedDistrict.status), fontWeight: '600' }}>
                  {' '}{selectedDistrict.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRID VIEW */}
      {activeTab === 'grid' && (
        <div style={{ margin: '0 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
            All 38 districts — sorted by open tickets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[...districtData].sort((a,b) => b.open - a.open).map((d, i) => (
              <div key={i} style={{
                background: getColor(d.status)+'15',
                border: `1.5px solid ${getColor(d.status)}40`,
                borderRadius: '12px', padding: '12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: getColor(d.status), margin: '4px 0' }}>
                  {d.open}
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>OPEN TICKETS</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTORS VIEW */}
      {activeTab === 'sectors' && (
        <div style={{ margin: '0 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
            Statewide grievances by department
          </div>
          {sectorData.map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '12px',
              padding: '14px', marginBottom: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.name}</span>
                <span style={{ fontWeight: '700', color: s.color }}>{s.count} open</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '99px', height: '8px' }}>
                <div style={{
                  width: `${s.pct}%`, height: '100%',
                  background: s.color, borderRadius: '99px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{s.pct}% of total</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
