import React, { useState, useEffect } from 'react';
import { Mail, UserX, CheckCircle, ShieldAlert, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { getSubscribersFromLocal, unsubscribeUser } from '../services/storageService';

export function UnsubscribePortal({ initialEmail = '', onSwitchToSubscribe }) {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email') || params.get('unsubscribe_email');
    if (urlEmail) {
      setEmailInput(urlEmail);
    } else if (initialEmail) {
      setEmailInput(initialEmail);
    }
  }, []);

  const handleInitialClick = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeUnsubscribe = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const emailToProcess = emailInput.trim().toLowerCase();

    try {
      const res = await unsubscribeUser({ email: emailToProcess });
      setLoading(false);
      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg('That email address was not found on our subscriber list.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      {result ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <UserX size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Email Removed</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <strong style={{ color: 'white' }}>{result.subscriber.email}</strong> has been unsubscribed from driver education course alerts.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setResult(null); setEmailInput(''); }}
            >
              Done
            </button>
            <button
              className="btn btn-primary"
              onClick={onSwitchToSubscribe}
            >
              Re-Subscribe Email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleInitialClick}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="unsubscribe-simple-email" style={{ fontSize: '0.95rem' }}>
              Enter Email Address to Remove:
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="unsubscribe-simple-email"
                type="email"
                required
                className="form-input"
                placeholder="your.email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ padding: '0.9rem 1rem 0.9rem 2.8rem', fontSize: '1.05rem' }}
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-danger btn-full"
            style={{ padding: '0.95rem', fontSize: '1.05rem', fontWeight: '700' }}
            id="btn-simple-unsubscribe"
          >
            {loading ? 'Processing...' : 'Remove My Email Address'}
          </button>
        </form>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Confirm Unsubscribe</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to remove this email address from the McMichael Driver Education contact list?
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #f43f5e',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#f87171',
              wordBreak: 'break-all',
              marginBottom: '1.5rem'
            }}>
              {emailInput.trim().toLowerCase()}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowConfirmModal(false)}
              >
                <Edit2 size={16} /> Edit Email
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={executeUnsubscribe}
              >
                Confirm & Remove <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
