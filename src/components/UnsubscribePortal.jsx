import React, { useState, useEffect } from 'react';
import { Mail, UserX, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { unsubscribeUser } from '../services/storageService';

export function UnsubscribePortal({ initialEmail = '', onClose }) {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
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
              <strong style={{ color: '#0f172a' }}>{result.subscriber.email}</strong> has been unsubscribed from driver education course alerts.
            </p>

            <button
              className="btn btn-secondary btn-full"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#e11d48' }}>Unsubscribe from Contact List</h3>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Enter your email address below to remove yourself from our course notification list.
            </p>

            <form onSubmit={handleInitialClick}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="modal-unsubscribe-email" style={{ fontSize: '0.95rem' }}>
                  Email Address to Remove:
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="modal-unsubscribe-email"
                    type="email"
                    required
                    autoFocus
                    className="form-input"
                    placeholder="your.email@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: '#e11d48', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-danger"
                  style={{ flex: 1.5 }}
                >
                  {loading ? 'Processing...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Trash2 size={28} />
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Confirm Unsubscribe</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Are you sure you want to remove this email address from the McMichael Driver Education contact list?
              </p>

              <div style={{
                background: '#fff1f2',
                border: '1.5px solid #f43f5e',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1.15rem',
                fontWeight: '700',
                color: '#e11d48',
                wordBreak: 'break-all',
                marginBottom: '1.5rem'
              }}>
                {emailInput.trim().toLowerCase()}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1.5 }}
                  onClick={executeUnsubscribe}
                >
                  Confirm & Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
