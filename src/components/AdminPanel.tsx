import React, { useState, useEffect } from 'react';
import { getAdminUsersList, pruneAllUsers, type UserProfile } from '../utils/auth';

interface AdminPanelProps {
  onRefreshAppState: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefreshAppState }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ id: string; time: string; event: string; type: 'info' | 'warn' }[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const list = await getAdminUsersList();
      setUsers(list);
    };
    loadUsers();
    
    // Create random mock audits
    const events = [
      { event: "SMTP server initialized on port 25", type: 'info' as const },
      { event: "Admin panel loaded by credential validation", type: 'info' as const },
      { event: "Database key check success: typepulse_users_db found", type: 'info' as const },
      { event: "Rate limit tracker verified: max 5 attempts/30s", type: 'info' as const }
    ];
    setAuditLogs(events.map((e, i) => ({
      id: i.toString(),
      time: new Date(Date.now() - i * 60000).toLocaleTimeString(),
      ...e
    })));
  }, []);

  const handlePrune = () => {
    if (window.confirm("WARNING: Are you sure you want to completely erase the mock user database? This deletes all accounts and logs.")) {
      pruneAllUsers();
      onRefreshAppState();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px 20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🛠️</span>
          <h1 style={{ fontSize: '32px' }}>Admin Control Center</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
          Manage local mock accounts, inspect failed authentication logs, verify SMTP delivery history, and clear schemas.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* User Database Accounts */}
        <div className="card-glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--primary)' }}>Registered User Profiles ({users.length})</h3>
          
          {users.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px', fontSize: '14px', fontStyle: 'italic' }}>
              No accounts registered yet. Go to Sign Up to create accounts.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Name / Email</th>
                    <th style={{ padding: '8px' }}>Level</th>
                    <th style={{ padding: '8px' }}>XP</th>
                    <th style={{ padding: '8px' }}>Streak</th>
                    <th style={{ padding: '8px' }}>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>{u.level}</td>
                      <td style={{ padding: '10px 8px' }}>{u.xp} XP</td>
                      <td style={{ padding: '10px 8px' }}>🔥 {u.dailyStreak}d</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                          {u.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Logs Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card-glass" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--accent)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>System Console</h3>
            <div style={{
              background: '#020617',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              height: '180px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              color: '#34d399'
            }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ color: log.type === 'warn' ? '#fbbf24' : '#34d399' }}>
                  <span style={{ color: '#64748b' }}>[{log.time}]</span> {log.event}
                </div>
              ))}
              <div>[INFO] Awaiting further auth hooks...</div>
            </div>
          </div>

          {/* Database actions */}
          <div className="card-glass" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--error)', marginBottom: '8px', fontWeight: 'bold' }}>Database Operations</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Purges `typepulse_users_db` and logs out current session.
            </p>
            <button onClick={handlePrune} className="btn-secondary" style={{
              width: '100%',
              borderColor: 'var(--error)',
              color: 'var(--error)',
              background: 'transparent',
              fontSize: '12px',
              height: '36px',
              justifyContent: 'center'
            }}>
              ⚠️ Erase User Database
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
