import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import AddHabit from './AddHabit';
import HabitList from './HabitList';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Habits() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await api.get('/habits');
            const habitsData = response.data;

            const habitsWithStats = habitsData.map(habit => {
                const completedDates = habit.habit_logs.map(log => log.completed_at);
                return {
                    ...habit,
                    completedDates,
                    streak: calculateStreak(completedDates),
                    todayCompleted: completedDates.includes(new Date().toISOString().split('T')[0])
                };
            });

            setHabits(habitsWithStats);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const calculateStreak = (dates) => {
        if (!dates || dates.length === 0) return 0;
        const sorted = [...new Set(dates)].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let streak = 0;
        let currentCheck = today;

        if (!sorted.includes(today)) {
            if (!sorted.includes(yesterday)) return 0;
            currentCheck = yesterday;
        }

        while (sorted.includes(currentCheck)) {
            streak++;
            const d = new Date(currentCheck);
            d.setDate(d.getDate() - 1);
            currentCheck = d.toISOString().split('T')[0];
        }
        return streak;
    };

    const addHabit = async (name, icon) => {
        try {
            await api.post('/habits', { name, icon });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleHabit = async (id) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        try {
            // Optimistic UI could be added here, but simplest is update then fetch
            const response = await api.post(`/habits/${id}/toggle`, { isCompleted: habit.todayCompleted });

            if (response.data.status === 'added') {
                triggerConfetti();
            }
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const triggerConfetti = () => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };

    const deleteHabit = async (id) => {
        if (!window.confirm('Delete this habit?')) return;
        try {
            await api.delete(`/habits/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">My Habits</h2>
            <AddHabit onAdd={addHabit} />
            {loading ? <div>Loading...</div> : <HabitList habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} />}
        </div>
    );
}

export default Habits;
