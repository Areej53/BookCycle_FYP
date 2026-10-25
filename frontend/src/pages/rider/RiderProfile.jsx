import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const RiderProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rider/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error('Failed to fetch rider profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setToggling(true);
      const res = await api.put('/rider/toggle-availability');
      setProfileData(prev => {
        const app = res.data.application || prev?.application || {};
        return {
          ...(prev || {}),
          application: {
            ...app,
            isRiderActive: res.data.isRiderActive
          }
        };
      });
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      alert('Failed to update availability.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
        <div style={{
          width: '45px',
          height: '45px',
          border: '4px solid rgba(19, 73, 60, 0.1)',
          borderTop: '4px solid #13493C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ fontSize: '1rem', fontWeight: '500', color: '#13493C' }}>Loading Rider Profile...</div>
      </div>
    );
  }

  const user = profileData?.user || {};
  const application = profileData?.application || {};

  const fullName = application.fullName || user.name || 'N/A';
  const email = user.email || 'N/A';
  const phone = application.phone || user.phone || 'N/A';
  const cnic = application.cnic || 'N/A';
  const city = application.city || user.city || 'N/A';
  const address = application.address || user.address || 'N/A';
  const vehicleType = application.vehicleType || 'N/A';
  const vehicleNumber = application.vehicleNumber || 'N/A';
  const drivingLicenseNumber = application.drivingLicenseNumber || 'N/A';
  const isActive = application.isRiderActive ?? true;
  const status = application.status || 'APPROVED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Profile Header Card */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {application.profileImage ? (
            <img
              src={application.profileImage}
              alt={fullName}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #13493C' }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#13493C',
              color: '#FAF9F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800'
            }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: '#13493C', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
              {fullName}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#667F68', marginBottom: '8px' }}>
              Registered BookCycle Rider
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: '#E8F5E9',
                color: '#2E7D32'
              }}>
                {status}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: isActive ? '#E8F5E9' : '#ECEFF1',
                color: isActive ? '#2E7D32' : '#546E7A'
              }}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle availability button */}
        <button
          onClick={handleToggleActive}
          disabled={toggling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: isActive ? '#13493C' : '#DDA15E',
            color: isActive ? '#FAF9F0' : '#13493C',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: toggling ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          {toggling ? 'Updating...' : isActive ? 'Set INACTIVE' : 'Set ACTIVE'}
        </button>
      </div>

      {/* Personal Information */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '24px 30px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#13493C', borderBottom: '1px solid rgba(19, 73, 60, 0.1)', paddingBottom: '8px' }}>
          Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Full Name</div>
            <strong style={{ color: '#13493C' }}>{fullName}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Email Address</div>
            <strong style={{ color: '#13493C' }}>{email}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Phone Number</div>
            <strong style={{ color: '#13493C' }}>{phone}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>CNIC Number</div>
            <strong style={{ color: '#13493C' }}>{cnic}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>City</div>
            <strong style={{ color: '#13493C' }}>{city}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Address</div>
            <strong style={{ color: '#13493C' }}>{address}</strong>
          </div>
        </div>
      </div>

      {/* Vehicle & Driving License */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '16px',
        padding: '24px 30px',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.05)',
        border: '1px solid rgba(19, 73, 60, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#13493C', borderBottom: '1px solid rgba(19, 73, 60, 0.1)', paddingBottom: '8px' }}>
          Vehicle & Driving License
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.9rem', marginBottom: '20px' }}>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Vehicle Type</div>
            <strong style={{ color: '#13493C' }}>{vehicleType}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Vehicle Registration Number</div>
            <strong style={{ color: '#13493C' }}>{vehicleNumber}</strong>
          </div>
          <div>
            <div style={{ color: '#667F68', fontSize: '0.8rem', marginBottom: '2px' }}>Driving License Number</div>
            <strong style={{ color: '#13493C' }}>{drivingLicenseNumber}</strong>
          </div>
        </div>

        {application.drivingLicenseImage && (
          <div>
            <div style={{ color: '#667F68', fontSize: '0.82rem', marginBottom: '8px' }}>Uploaded Driving License Document:</div>
            <img
              src={application.drivingLicenseImage}
              alt="Driving License"
              style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', border: '1px solid #DDD', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default RiderProfile;
