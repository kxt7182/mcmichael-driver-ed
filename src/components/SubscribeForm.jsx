import React, { useState } from 'react';
import { Mail, Check, Send, Sparkles, Info, AlertCircle, Edit2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscribeUser } from '../services/storageService';

export function SubscribeForm({ onSwitchToUnsubscribe }) {
  const [email, setEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial button click: validates email & opens confirmation modal
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

  // Final confirmation button click
  const executeSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await subscribeUser({ email: cleanEmail });

      setLoading(false);
      setSubmittedData(result);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to process subscription. Please try again.');
    }
  };

  return (
    <div>
      {submittedData ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Check size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>You're Subscribed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
            <strong style={{ color: '#38bdf8' }}>{submittedData.subscriber.email}</strong> will receive notifications on upcoming driver education classes.
          </p>

          {submittedData.apiResult?.isLocalFallback && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(56,189,248,0.08)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Saved locally. Connect a Google Sheet anytime via the ⚙️ icon in the top right.
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setSubmittedData(null); setEmail(''); }}
            >
              Add Another Email
            </button>
            <button
              className="btn btn-secondary"
              onClick={onSwitchToUnsubscribe}
              style={{ color: '#f87171' }}
            >
              Need to Unsubscribe?
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleInitialClick}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="simple-email-input" style={{ fontSize: '0.95rem' }}>
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="simple-email-input"
                type="email"
                required
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            className="btn btn-primary btn-full"
            style={{ padding: '0.95rem', fontSize: '1.05rem', fontWeight: '700' }}
            id="btn-simple-subscribe"
          >
            {loading ? 'Processing...' : 'Join Contact List'}
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
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Mail size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Confirm Email Address</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Please double check your email address before joining the McMichael Driver Education contact list:
            </p>

            <div style={{
              background: '#f0f9ff',
              border: '1.5px solid #0284c7',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#0369a1',
              wordBreak: 'break-all',
              marginBottom: '1.5rem'
            }}>
              {email.trim().toLowerCase()}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowConfirmModal(false)}
                id="btn-edit-email"
              >
                <Edit2 size={16} /> Edit Email
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={executeSubmit}
                id="btn-confirm-submit"
              >
                Confirm & Submit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
