function Header({ user, profile }) {
    const level = profile?.level || 1;
    const xp = profile?.xp || 0;
    const nextLevelXp = level * 100;
    const progress = (xp % 100) / 100 * 100;

    return (
        <header className="header-container">
            <div className="user-info">
                <div className="avatar">
                    {user.email[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="app-title">Habit Tracker</h1>
                    <div className="level-badge">
                        <span className="level-number">LVL {level}</span>
                        <span className="xp-text">{xp} XP</span>
                    </div>
                </div>
            </div>

            <div className="xp-bar-container" title={`${xp % 100} / 100 XP to next level`}>
                <div className="xp-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Absolute positioned logout for layout balance */}
            {/* We can handle logout via a small icon or button in the corner */}
        </header>
    );
}

export default Header;
