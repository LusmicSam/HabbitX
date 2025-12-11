const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Helper to get authenticated client based on request token
const getSupabase = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });
};

// Middleware to check auth
const requireAuth = (req, res, next) => {
    const supabase = getSupabase(req);
    if (!supabase) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    req.supabase = supabase;
    next();
};

// --- Routes ---

// Get Dashboard Data (Hybrid of Habits, Logs, and Profile)
app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
        // We need the user ID. We can get it from the user object via getUser
        const { data: { user }, error: authError } = await req.supabase.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

        // Parallel fetch
        const [profileReq, habitsReq, badgesReq] = await Promise.all([
            req.supabase.from('profiles').select('*').eq('id', user.id).single(),
            req.supabase.from('habits').select('*, habit_logs(completed_at)').order('created_at', { ascending: false }),
            req.supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id)
        ]);

        if (habitsReq.error) throw habitsReq.error;

        // Calculate Stats on Server
        const habits = habitsReq.data;
        const totalHabits = habits.length;

        // Active streaks (completed today)
        const today = new Date().toISOString().split('T')[0];
        const activeStreaks = habits.filter(h => {
            return h.habit_logs.some(l => l.completed_at === today);
        }).length;

        // Weekly Chart Data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i);
            return d.toISOString().split('T')[0];
        });

        const chartData = last7Days.map(date => {
            const count = habits.reduce((acc, h) => {
                return acc + (h.habit_logs.some(l => l.completed_at === date) ? 1 : 0);
            }, 0);
            return { day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), completed: count };
        });

        res.json({
            profile: profileReq.data || { xp: 0, level: 1 },
            stats: { totalHabits, activeStreaks },
            chartData,
            badges: badgesReq.data || []
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Habits
app.get('/api/habits', requireAuth, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('habits')
            .select('*, habit_logs(completed_at)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Habit
app.post('/api/habits', requireAuth, async (req, res) => {
    const { name, icon } = req.body;
    try {
        const { data: { user } } = await req.supabase.auth.getUser();
        const { data, error } = await req.supabase
            .from('habits')
            .insert([{ user_id: user.id, name, icon }])
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Habit
app.delete('/api/habits/:id', requireAuth, async (req, res) => {
    try {
        const { error } = await req.supabase
            .from('habits')
            .delete()
            .match({ id: req.params.id });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Habit (Complex Logic Moved to Server)
app.post('/api/habits/:id/toggle', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { isCompleted } = req.body; // Client tells us current state, simpler
    const today = new Date().toISOString().split('T')[0];

    try {
        if (isCompleted) {
            // Untoggle
            await req.supabase.from('habit_logs').delete().match({ habit_id: id, completed_at: today });
            // Decrement XP
            await updateXP(req.supabase, -10);
            res.json({ status: 'removed' });
        } else {
            // Toggle
            await req.supabase.from('habit_logs').insert({ habit_id: id, completed_at: today });
            // Increment XP
            const newLevel = await updateXP(req.supabase, 10);

            // Check for badges (Simple server-side check)
            // Note: Realistically we'd query streaks here, but keeping it simple for now

            res.json({ status: 'added', newLevel });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Helper for XP
async function updateXP(supabaseClient, amount) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { data: profile } = await supabaseClient.from('profiles').select('xp, level').eq('id', user.id).single();

    if (!profile) return null;

    const newXP = Math.max(0, profile.xp + amount);
    const newLevel = Math.floor(newXP / 100) + 1;

    await supabaseClient.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', user.id);
    return newLevel;
}

// Reset Profile
app.post('/api/profile/reset', requireAuth, async (req, res) => {
    try {
        const { data: { user } } = await req.supabase.auth.getUser();
        await req.supabase.from('profiles').update({ xp: 0, level: 1 }).eq('id', user.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export for Vercel Serverless
module.exports = app;

// Only listen if running locally
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
