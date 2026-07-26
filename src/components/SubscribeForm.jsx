import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Edit2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscribeUser } from '../services/storageService';

export function SubscribeForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial button click: validates email & opens verification confirmation modal
  const handleInitialClick = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setShowConfirmModal(true);
  };

  // Final confirmation submit - stays on confirmation screen during loading
  const executeSubmit = async () => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await subscribeUser({ email: cleanEmail });

      setLoading(false);
      setShowConfirmModal(false); // Close confirm modal only after response is ready
      setSubmittedData(result);

      if (!result.isAlreadyActive) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (err) {}
      }
    } catch (err) {
      setLoading(false);
      setShowConfirmModal(false);
      setErrorMsg('Failed to process subscription. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
        {submittedData ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: submittedData.isAlreadyActive ? 'rgba(18, 73, 160, 0.12)' : 'rgba(16, 185, 129, 0.15)',
              color: submittedData.isAlreadyActive ? '#1249a0' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              {submittedData.isAlreadyActive ? <AlertCircle size={36} /> : <Check size={36} />}
            </div>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              {submittedData.isAlreadyActive ? "Already Subscribed!" : "You're Subscribed!"}
            </h2>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              {submittedData.isAlreadyActive ? (
                <>
                  <strong style={{ color: '#1249a0' }}>{submittedData.subscriber.email}</strong> is already on the McMichael Driver Education contact list and receiving class notifications.
                </>
              ) : (
                <>
                  <strong style={{ color: '#1249a0' }}>{submittedData.subscriber.email}</strong> has been added to the McMichael Driver Education contact list. When updates are available you will be notified.
                </>
              )}
            </p>

            <button
              className="btn btn-secondary btn-full"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1249a0' }}>Subscribe to the Contact List</h3>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Enter your email address below to subscribe
            </p>

            <form onSubmit={handleInitialClick}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="modal-subscribe-email" style={{ fontSize: '0.95rem' }}>
                  Email Address:
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="modal-subscribe-email"
                    type="email"
                    required
                    autoFocus
                    className="form-input"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  className="btn btn-secondary"
                  style={{ flex: 1.5, fontWeight: '700' }}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inner Email Verification Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => !loading && setShowConfirmModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#1249a0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Mail size={28} />
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Confirm Email Address</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Please double check your email address before submitting:
              </p>

              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #1249a0',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1.15rem',
                fontWeight: '700',
                color: '#1249a0',
                wordBreak: 'break-all',
                marginBottom: '1.5rem'
              }}>
                {email.trim().toLowerCase()}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={loading}
                  onClick={() => setShowConfirmModal(false)}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1.5, fontWeight: '700' }}
                  disabled={loading}
                  onClick={executeSubmit}
                >
                  {loading ? 'Processing...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
