import { useState } from 'react';

const EMOJIS = ['📝', '💧', '🏃', '📚', '🧘', '💰', '🥦', '💤'];

function AddHabit({ onAdd }) {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('📝');
    const [showPicker, setShowPicker] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name, selectedIcon);
        setName('');
        setSelectedIcon('📝');
        setShowPicker(false);
    };

    return (
        <form className="add-habit-form" onSubmit={handleSubmit}>
            <div className="input-group">
                <div className="icon-selector" style={{ position: 'relative' }}>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setShowPicker(!showPicker)}
                        style={{
                            padding: '16px',
                            fontSize: '1.2rem',
                            border: 'none',
                            background: 'white',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        {selectedIcon}
                    </button>

                    {showPicker && (
                        <div className="emoji-picker" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            background: 'white',
                            padding: '10px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '5px',
                            zIndex: 10,
                            marginTop: '5px'
                        }}>
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => { setSelectedIcon(emoji); setShowPicker(false); }}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        padding: '5px'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    className="habit-input"
                    placeholder="New habit (e.g., Drink Water)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button type="submit" className="add-btn" disabled={!name.trim()}>
                    Add
                </button>
            </div>
        </form>
    );
}

export default AddHabit;
