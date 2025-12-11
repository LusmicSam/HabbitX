import HabitStats from './HabitStats';

function HabitItem({ habit, onToggle, onDelete }) {
    return (
        <div className="habit-card">
            <div className="habit-main">
                <div className="habit-icon-wrapper" style={{
                    fontSize: '2rem',
                    marginRight: '15px',
                    background: 'rgba(255,255,255,0.5)',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px'
                }}>
                    {habit.icon || '📝'}
                </div>

                <div className="habit-content">
                    <h3 className="habit-name">{habit.name}</h3>
                    <div className="habit-meta">
                        <span className="streak-badge">
                            🔥 {habit.streak} day streak
                        </span>
                        {habit.bestStreak > 0 && (
                            <span style={{ marginLeft: '10px' }}>🏆 Best: {habit.bestStreak}</span>
                        )}
                    </div>
                </div>

                <div className="check-container">
                    <button
                        className={`check-btn ${habit.todayCompleted ? 'completed' : ''}`}
                        onClick={() => onToggle(habit.id)}
                        title={habit.todayCompleted ? "Completed!" : "Mark as done"}
                    >
                        {habit.todayCompleted ? '✓' : ''}
                    </button>
                </div>

                <button
                    className="delete-btn"
                    onClick={() => onDelete(habit.id)}
                    title="Delete habit"
                >
                    🗑️
                </button>
            </div>

            <HabitStats completedDates={habit.completedDates || []} />
        </div>
    );
}

export default HabitItem;
