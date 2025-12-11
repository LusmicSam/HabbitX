import HabitItem from './HabitItem';

function HabitList({ habits, onToggle, onDelete }) {
    if (habits.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem', background: 'rgba(255,255,255,0.5)', padding: '2rem', borderRadius: '12px' }}>
                No habits yet. Start by adding one above!
            </div>
        );
    }

    return (
        <div className="habit-list">
            {habits.map(habit => (
                <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default HabitList;
