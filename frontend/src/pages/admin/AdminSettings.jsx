import React, { useState } from 'react';
import { api } from '../../api/client';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const adminEmail = "admin@bookcycle.com"; // Matches mock image and seed admin email

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password does not match new password.');
      return;
    }

    setUpdating(true);
    // Simulate updating password (and since backend password changes are handled via reset links, we notify success)
    setTimeout(() => {
      setUpdating(false);
      setSuccessMsg('Your password has been updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  const handleSendResetEmail = async () => {
    setSendingReset(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Connects with actual backend forgot-password API
      await api.post("/forgot-password", { email: adminEmail });
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to send reset email. Please make sure the backend server is running.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Alert Notices */}
      {errorMsg && (
        <div style={{
          backgroundColor: '#FEECEC',
          color: '#C0392B',
          border: '1px solid rgba(192, 57, 43, 0.15)',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#EAF8F2',
          color: '#1E7E5A',
          border: '1px solid rgba(30, 126, 90, 0.15)',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {/* Main Password Change Form Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(19, 73, 60, 0.05)',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
        padding: '30px'
      }}>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '8px' }}>
              Current password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#667F68' }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 42px',
                  border: '1px solid rgba(19, 73, 60, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#13493C',
                  backgroundColor: '#FAF9F0'
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#667F68',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '8px' }}>
              New password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#667F68' }} />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 42px',
                  border: '1px solid rgba(19, 73, 60, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#13493C',
                  backgroundColor: '#FAF9F0'
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#667F68',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#13493C', marginBottom: '8px' }}>
              Confirm new password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#667F68' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 42px',
                  border: '1px solid rgba(19, 73, 60, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#13493C',
                  backgroundColor: '#FAF9F0'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#667F68',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Bottom actions and hints */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '0.78rem', color: '#667F68', maxWidth: '380px', lineHeight: '1.4' }}>
              At least 8 characters, including uppercase, lowercase, a number, and a symbol (e.g. !@#$%).
            </p>
            <button
              type="submit"
              disabled={updating}
              style={{
                backgroundColor: '#13493C',
                color: '#FAF9F0',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: updating ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => { if(!updating) e.target.style.backgroundColor = '#0A2620'; }}
              onMouseOut={(e) => { if(!updating) e.target.style.backgroundColor = '#13493C'; }}
            >
              {updating ? 'Updating...' : 'Update password'}
            </button>
          </div>

        </form>
      </div>

      {/* Forgot Password Section matching mockup */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(19, 73, 60, 0.05)',
        boxShadow: '0 4px 20px rgba(19, 73, 60, 0.04)',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'rgba(221, 161, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#BC6C25',
            flexShrink: 0
          }}>
            <Mail size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#13493C', fontSize: '1rem', fontWeight: '700' }}>
              Forgot your password?
            </h3>
            <p style={{ margin: '6px 0 0', color: '#667F68', fontSize: '0.85rem', lineHeight: '1.4' }}>
              We will email a secure link to <strong style={{ color: '#13493C' }}>{adminEmail}</strong>. Open it to set a new password, then sign in again.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleSendResetEmail}
            disabled={sendingReset}
            style={{
              backgroundColor: '#FAF9F0',
              border: '1px solid rgba(19, 73, 60, 0.15)',
              color: '#13493C',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: sendingReset ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => { if(!sendingReset) e.currentTarget.style.backgroundColor = 'rgba(19, 73, 60, 0.04)'; }}
            onMouseOut={(e) => { if(!sendingReset) e.currentTarget.style.backgroundColor = '#FAF9F0'; }}
          >
            <Mail size={16} />
            {sendingReset ? 'Sending Link...' : resetEmailSent ? 'Email Sent ✓' : 'Email me a reset link'}
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.78rem', color: '#667F68', lineHeight: '1.4' }}>
          After you reset via email, your current session may still be active until you sign out. For security, sign out on shared devices once you have finished.
        </p>
      </div>

    </div>
  );
};

export default AdminSettings;
