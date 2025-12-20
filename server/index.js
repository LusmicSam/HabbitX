const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Habit = require('./models/Habit');
const Badge = require('./models/Badge');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_prod';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Authentication Middleware ---
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId }; // Attach minimal user info
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// --- Auth Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create User
        const user = await User.create({ username, email, password });

        // Create initial Profile
        await Profile.create({ userId: user._id });

        // Generate Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- App Routes (Protected) ---

// Get Dashboard Data
app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Parallel Fetch: Profile (Upsert), Habits
        let profile = await Profile.findOne({ userId }).populate('earnedBadges');
        // Fallback if profile missing (shouldn't happen with signup logic, but good for safety)
        if (!profile) {
            profile = await Profile.create({ userId });
        }

        const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

        // Calculate Stats
        const totalHabits = habits.length;

        // Active Streaks (Completed Today)
        const today = new Date().toISOString().split('T')[0];
        const activeStreaks = habits.filter(h => h.completedDates.includes(today)).length;

        // Weekly Chart Data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i);
            return d.toISOString().split('T')[0];
        });

        const chartData = last7Days.map(date => {
            const count = habits.reduce((acc, h) => {
                return acc + (h.completedDates.includes(date) ? 1 : 0);
            }, 0);
            return { day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), completed: count };
        });

        res.json({
            profile,
            stats: { totalHabits, activeStreaks },
            chartData,
            badges: profile.earnedBadges || []
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Habits
app.get('/api/habits', requireAuth, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });

        // Transform to match frontend expectation (Supabase shape)
        const formattedHabits = habits.map(h => ({
            id: h._id,
            user_id: h.userId,
            name: h.name,
            icon: h.icon,
            created_at: h.createdAt,
            habit_logs: h.completedDates.map(date => ({ completed_at: date }))
        }));

        res.json(formattedHabits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Habit
app.post('/api/habits', requireAuth, async (req, res) => {
    const { name, icon } = req.body;
    try {
        const newHabit = await Habit.create({
            userId: req.user.id,
            name,
            icon
        });

        // Return structured like fetching for consistency (optional but helpful)
        res.json({
            id: newHabit._id,
            name: newHabit.name,
            icon: newHabit.icon,
            completedDates: newHabit.completedDates
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Habit
app.delete('/api/habits/:id', requireAuth, async (req, res) => {
    try {
        const result = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!result) return res.status(404).json({ error: 'Habit not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Habit
app.post('/api/habits/:id/toggle', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { isCompleted } = req.body; // true = add, false = remove
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user.id;

    try {
        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        let xpChange = 0;

        if (isCompleted) {
            // Check if already completed to avoid double counting
            if (!habit.completedDates.includes(today)) {
                habit.completedDates.push(today);
                await habit.save();
                xpChange = 10;
            }
        } else {
            // Remove
            habit.completedDates = habit.completedDates.filter(d => d !== today);
            await habit.save();
            xpChange = -10;
        }

        // Update Profile XP
        const profile = await Profile.findOne({ userId });
        if (profile && xpChange !== 0) {
            profile.xp = Math.max(0, profile.xp + xpChange);
            profile.level = Math.floor(profile.xp / 100) + 1;
            await profile.save();
        }

        res.json({
            status: isCompleted ? 'added' : 'removed',
            newLevel: profile ? profile.level : 1
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Reset Profile
app.post('/api/profile/reset', requireAuth, async (req, res) => {
    try {
        await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { xp: 0, level: 1 },
            { upsert: true }
        );
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
