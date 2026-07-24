import React, { useState, useEffect } from 'react';
import { SubscribeForm } from './components/SubscribeForm';
import { UnsubscribePortal } from './components/UnsubscribePortal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { AdminDashboard } from './components/AdminDashboard';
import { getGoogleScriptUrl } from './services/storageService';
import { Car, Settings, UserCheck, UserMinus, ShieldCheck, Database } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('subscribe'); // 'subscribe' | 'unsubscribe' | 'admin'
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [scriptUrl, setScriptUrl] = useState(getGoogleScriptUrl());
  const [initialEmail, setInitialEmail] = useState('');

  // Check URL query parameters for direct email unsubscribe link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const email = params.get('email') || params.get('unsubscribe_email');

    if (email) {
      setInitialEmail(email);
    }

    if (action === 'unsubscribe' || email) {
      setActiveTab('unsubscribe');
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


      {/* Main Container Card */}
      <div style={{ width: '100%', maxWidth: activeTab === 'admin' ? '1000px' : '540px', margin: '0 auto' }}>
        
        {/* App Title Header inside card context */}
        {activeTab !== 'admin' && (
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
            }}>
              <Car size={30} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              McMichael Driver Education <br /><span className="gradient-text">Contact List</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {activeTab === 'subscribe'
                ? 'Get notified when new driver education classes open.'
                : 'Remove your email address from our contact list.'}
            </p>
          </div>
        )}

        {/* Tab Switcher Pills */}
        {activeTab !== 'admin' && (
          <div style={{
            display: 'flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <button
              className={`nav-tab-btn ${activeTab === 'subscribe' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscribe')}
              style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
              id="tab-subscribe"
            >
              <UserCheck size={16} /> Subscribe
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'unsubscribe' ? 'active' : ''}`}
              onClick={() => setActiveTab('unsubscribe')}
              style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
              id="tab-unsubscribe"
            >
              <UserMinus size={16} /> Self-Service Unsubscribe
            </button>
          </div>
        )}

        {/* Main Glassmorphism Card */}
        <div className="glass-card">
          {activeTab === 'subscribe' && (
            <SubscribeForm onSwitchToUnsubscribe={() => setActiveTab('unsubscribe')} />
          )}

          {activeTab === 'unsubscribe' && (
            <UnsubscribePortal
              initialEmail={initialEmail}
              onSwitchToSubscribe={() => setActiveTab('subscribe')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              scriptUrl={scriptUrl}
            />
          )}
        </div>
      </div>

      {/* Google Sheet Modal */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onUrlUpdated={(newUrl) => setScriptUrl(newUrl)}
      />
    </div>
  );
}

export default App;
