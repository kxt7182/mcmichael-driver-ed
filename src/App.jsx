import React, { useState, useEffect } from 'react';
import { SubscribeForm } from './components/SubscribeForm';
import { UnsubscribePortal } from './components/UnsubscribePortal';
import { getGoogleScriptUrl } from './services/storageService';
import { UserCheck, UserMinus } from 'lucide-react';

import schoolLogo from './assets/school-logo.png';

export function App() {
  const [activeModal, setActiveModal] = useState(null); // null | 'subscribe' | 'unsubscribe'
  const [initialEmail, setInitialEmail] = useState('');

  // Check URL query parameters for direct email unsubscribe link e.g. ?action=unsubscribe&email=user@example.com
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const email = params.get('email') || params.get('unsubscribe_email');

    if (email) {
      setInitialEmail(email);
    }

    if (action === 'unsubscribe' || email) {
      setActiveModal('unsubscribe');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>

      {/* Main Card Container */}
      <div style={{ width: '100%', maxWidth: '540px', margin: '0 auto' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          
          {/* McMichael School Logo */}
          <div style={{ textAlign: 'center', marginBottom: '-0.5rem', marginTop: '-0.5rem' }}>
            <img
              src={schoolLogo}
              alt="McMichael High School Phoenix Logo"
              style={{
                height: '270px',
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto',
                filter: 'drop-shadow(0 6px 16px rgba(18, 73, 160, 0.12))'
              }}
            />
          </div>

          {/* Header Title */}
          <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '0.35rem', letterSpacing: '-0.02em', marginTop: '0' }}>
            McMichael Driver Education <br /><span className="gradient-text">Contact List</span>
          </h1>

          {/* Subtitle */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Get notified when new driver education classes open.
          </p>

          {/* Action Buttons: Subscribe or Unsubscribe */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-success"
              style={{ padding: '0.95rem 2rem', fontSize: '1.1rem', flex: '1 1 180px' }}
              onClick={() => setActiveModal('subscribe')}
              id="btn-main-subscribe"
            >
              <UserCheck size={20} /> Subscribe
            </button>

            <button
              className="btn btn-danger"
              style={{ padding: '0.95rem 2rem', fontSize: '1.1rem', flex: '1 1 180px' }}
              onClick={() => setActiveModal('unsubscribe')}
              id="btn-main-unsubscribe"
            >
              <UserMinus size={20} /> Unsubscribe
            </button>
          </div>

        </div>
      </div>

      {/* Subscribe Modal */}
      {activeModal === 'subscribe' && (
        <SubscribeForm onClose={() => setActiveModal(null)} />
      )}

      {/* Unsubscribe Modal */}
      {activeModal === 'unsubscribe' && (
        <UnsubscribePortal
          initialEmail={initialEmail}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

export default App;
