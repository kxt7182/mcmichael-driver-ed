import React, { useState, useEffect } from 'react';
import { Database, Download, Search, RefreshCw, Mail, CheckCircle2, UserX, Users, Filter, Sparkles, Send, Copy, Check } from 'lucide-react';
import { getSubscribersFromLocal, saveSubscribersToLocal } from '../services/storageService';

export function AdminDashboard({ onOpenSyncModal, scriptUrl }) {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTopicEmail, setSelectedTopicEmail] = useState('Teen Drivers Ed (30-Hr)');
  const [copiedDraft, setCopiedDraft] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getSubscribersFromLocal();
    setSubscribers(list);
  };

  const handleToggleStatus = (email) => {
    const updated = subscribers.map((sub) => {
      if (sub.email.toLowerCase() === email.toLowerCase()) {
        const isNowActive = sub.status !== 'ACTIVE';
        return {
          ...sub,
          status: isNowActive ? 'ACTIVE' : 'UNSUBSCRIBED',
          unsubscribeDate: isNowActive ? null : new Date().toISOString(),
          feedback: isNowActive ? '' : 'Admin updated status'
        };
      }
      return sub;
    });
    setSubscribers(updated);
    saveSubscribersToLocal(updated);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ['Email', 'Name', 'Courses', 'Status', 'Registered Date', 'Unsubscribe Date', 'Feedback'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name}"`,
      `"${Array.isArray(s.courses) ? s.courses.join('; ') : s.courses}"`,
      `"${s.status}"`,
      `"${s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}"`,
      `"${s.unsubscribeDate ? new Date(s.unsubscribeDate).toLocaleString() : ''}"`,
      `"${s.feedback || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `driver_ed_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(sub.courses) ? sub.courses.join(' ') : sub.courses).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === 'ACTIVE').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'UNSUBSCRIBED').length;

  const emailDraftBody = `Subject: New Driver Education Course Schedule Announced! 🚘

Hello {{Name}},

We are excited to announce new course openings for: ${selectedTopicEmail}.

Classroom and behind-the-wheel slots fill up quickly! You can view the new schedule and reserve your seat on our website.

--------------------------------------------------
Manage Your Subscription:
You are receiving this email because you registered for Driver Ed course updates.
To modify your course preferences or unsubscribe anytime, click here:
https://your-driver-ed-app.com/?action=unsubscribe&email={{Email}}
--------------------------------------------------`;

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(emailDraftBody);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <section className="hero-section" style={{ paddingBottom: '1.5rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
          <Database size={13} /> Administration & Analytics
        </span>
        <h1 className="hero-title">
          Subscriber List & <span className="gradient-text">Google Drive Sync</span>
        </h1>
        <p className="hero-subtitle">
          View real-time mailing list entries, monitor active vs unsubscribed students, export CSV lists, and configure Google Sheets synchronization.
        </p>
      </section>

      {/* Sync banner */}
      <div className="sync-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="pulse-dot" />
          <div>
            <strong>Google Sheet Sync Status:</strong>{' '}
            <span style={{ color: scriptUrl ? '#34d399' : '#f59e0b' }}>
              {scriptUrl ? 'Live Sync Active' : 'Demo Local Storage Mode'}
            </span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onOpenSyncModal} id="btn-open-sync-config">
          <Sparkles size={14} /> Configure Google Sheet URL
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Entries</span>
            <Users size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{subscribers.length}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Subscribers</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>{activeCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Self-Unsubscribed</span>
            <UserX size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f87171' }}>{unsubscribedCount}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px' }}>
            <div className="input-wrapper" style={{ width: '100%' }}>
              <Search className="input-icon" size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Search email, name, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="nav-tabs" style={{ padding: '2px' }}>
              {['ALL', 'ACTIVE', 'UNSUBSCRIBED'].map((st) => (
                <button
                  key={st}
                  className={`nav-tab-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                >
                  {st}
                </button>
              ))}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} id="btn-export-csv">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Name</th>
                <th>Course Interests</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No matching subscribers found.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id || sub.email}>
                    <td style={{ fontWeight: '500' }}>{sub.email}</td>
                    <td>{sub.name}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {Array.isArray(sub.courses)
                          ? sub.courses.map((c, i) => (
                              <span key={i} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                {c}
                              </span>
                            ))
                          : sub.courses}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : 'badge-unsubscribed'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleStatus(sub.email)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        {sub.status === 'ACTIVE' ? 'Unsubscribe' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Announcement Email Broadcast Simulator */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} color="#38bdf8" /> Course Announcement Template Generator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Draft emails with automated 1-click self-service unsubscribe link footers.
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleCopyDraft}>
            {copiedDraft ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedDraft ? 'Copied to Clipboard' : 'Copy Template'}</span>
          </button>
        </div>

        <div className="form-group" style={{ maxWidth: '360px', marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="select-announcement-topic">Select Announcement Course Topic:</label>
          <select
            id="select-announcement-topic"
            className="form-input form-input-no-icon"
            value={selectedTopicEmail}
            onChange={(e) => setSelectedTopicEmail(e.target.value)}
          >
            <option value="Teen Drivers Ed (30-Hr)">Teen Drivers Ed (30-Hr)</option>
            <option value="Adult Defensive Driving">Adult Defensive Driving</option>
            <option value="Behind-the-Wheel Lessons">Behind-the-Wheel Lessons</option>
            <option value="DMV Permit & Exam Prep">DMV Permit & Exam Prep</option>
            <option value="Senior Driver Refresher">Senior Driver Refresher</option>
          </select>
        </div>

        <pre style={{
          background: '#090d16',
          padding: '1.25rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#cbd5e1',
          whiteSpace: 'pre-wrap',
          border: '1px solid var(--border-color)',
          lineHeight: '1.5'
        }}>
          {emailDraftBody}
        </pre>
      </div>
    </div>
  );
}
