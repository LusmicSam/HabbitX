import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

function Settings() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        // Create a specific endpoint for user profile or reuse dashboard
        api.get('/dashboard').then(res => {
            setProfile(res.data.profile);
        });
    }, [user]);

    const resetXP = async () => {
        if (!window.confirm("Are you sure? This will reset your Level to 1.")) return;
        setLoading(true);
        try {
            await api.post('/profile/reset');
            setProfile({ ...profile, xp: 0, level: 1 });
            setMsg("XP Reset!");
        } catch (err) {
            console.error(err);
            setMsg("Error resetting.");
        }
        setLoading(false);
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Settings</h2>

            <div className="bento-card" style={{ maxWidth: '600px' }}>
                <div className="card-title">Account Info</div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</label>
                    <div style={{ fontSize: '1.1rem' }}>{user.email}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Level</label>
                    <div style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{profile?.level || 1}</div>
                </div>

                <div className="card-title" style={{ marginTop: '20px', color: 'var(--danger-color)' }}>Danger Zone</div>
                <button
                    onClick={resetXP}
                    disabled={loading}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}
                >
                    Reset Progress
                </button>
                {msg && <span style={{ marginLeft: '10px', color: 'var(--success-color)' }}>{msg}</span>}
            </div>
        </div>
    );
}

export default Settings;
