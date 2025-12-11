import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductivityChart from './ProductivityChart';
import BadgeCase from './BadgeCase';
import { Trophy, Activity, Zap, Info } from 'lucide-react';
import api from '../services/api';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalHabits: 0, activeStreaks: 0, xp: 0, level: 1 });
    const [badges, setBadges] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                const { profile, stats, chartData, badges } = response.data;
                setStats({ ...stats, xp: profile.xp, level: profile.level });
                setBadges(badges);
                setChartData(chartData);
            } catch (err) {
                console.error("Server Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div>Loading Dashboard...</div>;

    return (
        <div className="page-container">
            <h2 className="page-title">Dashboard</h2>

            <div className="dashboard-grid">
                {/* Active Streaks */}
                <div className="bento-card">
                    <div className="card-title"><Zap size={18} color="#f59e0b" /> Active Streaks</div>
                    <div className="stat-value">{stats.activeStreaks}</div>
                    <div className="stat-label">Habits done today</div>
                </div>

                {/* XP & Levels */}
                <div className="bento-card">
                    <div className="card-title"><Activity size={18} color="#10b981" /> Level {stats.level}</div>
                    <div className="stat-value">{stats.xp} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>xp</span></div>

                    <div className="info-card">
                        <Info size={14} style={{ display: 'inline', marginRight: '5px' }} />
                        Earn <strong>10 XP</strong> per habit. <br />
                        Level Up every <strong>100 XP</strong>.
                    </div>
                </div>

                {/* Chart */}
                <div className="bento-card col-span-2 row-span-2">
                    <div className="card-title">Weekly Productivity</div>
                    <ProductivityChart data={chartData} />
                    <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                        Your activity over the last 7 days
                    </div>
                </div>

                {/* Badges */}
                <div className="bento-card row-span-2">
                    <div className="card-title"><Trophy size={18} color="#8b5cf6" /> Achievements</div>
                    <BadgeCase badges={badges} />
                    {badges.length === 0 && (
                        <div className="info-card" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }}>
                            <div style={{ marginBottom: '5px' }}><strong>Available Badges:</strong></div>
                            <div>🔥 7 Day Streak</div>
                            <div>🆙 Level 2</div>
                            <div>🌱 First Habit</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
