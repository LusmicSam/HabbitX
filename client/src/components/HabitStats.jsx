function HabitStats({ completedDates }) {
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getLast7Days();

    return (
        <div className="habit-stats">
            <div className="week-grid">
                {weekDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = completedDates.includes(dateStr);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });

                    return (
                        <div key={dateStr} className="day-column">
                            <span className="day-label">{dayName}</span>
                            <div
                                className={`day-dot ${isCompleted ? 'completed' : ''}`}
                                title={`${date.toLocaleDateString()}: ${isCompleted ? 'Done' : 'Missed'}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default HabitStats;
