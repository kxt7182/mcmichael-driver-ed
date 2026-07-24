import React from 'react';
import { Car, UserCheck, UserMinus, BookOpen, Database, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, scriptUrl, onOpenSyncModal }) {
  return (
    <header className="header">
      <div className="container nav-wrapper">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('subscribe'); }}>
          <div className="brand-icon-wrapper">
            <Car size={24} />
          </div>
          <div>
            <span>DriverEd</span><span className="gradient-text">Alerts</span>
          </div>
        </a>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'subscribe' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscribe')}
            id="tab-btn-subscribe"
          >
            <UserCheck size={16} />
            <span>Subscribe</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'unsubscribe' ? 'active' : ''}`}
            onClick={() => setActiveTab('unsubscribe')}
            id="tab-btn-unsubscribe"
          >
            <UserMinus size={16} />
            <span>Self-Service Unsubscribe</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            id="tab-btn-catalog"
          >
            <BookOpen size={16} />
            <span>Courses</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            id="tab-btn-admin"
          >
            <Database size={16} />
            <span>Admin & Sync</span>
          </button>
        </nav>

        <button 
          className={`badge ${scriptUrl ? 'badge-active' : 'badge-info'}`}
          style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.15)' }}
          onClick={onOpenSyncModal}
          title="Configure Google Drive Spreadsheet Sync"
          id="btn-google-sheet-status"
        >
          {scriptUrl ? (
            <>
              <CheckCircle2 size={13} />
              <span>Google Sheet Synced</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Connect Google Sheet</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
