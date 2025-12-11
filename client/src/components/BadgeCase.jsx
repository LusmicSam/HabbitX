function BadgeCase({ badges }) {
    return (
        <div className="badge-grid">
            {badges.map(userBadge => (
                <div key={userBadge.badge_id} className="badge-item" title={userBadge.badges?.description}>
                    <div className="badge-icon">{userBadge.badges?.icon || '🏆'}</div>
                    <div className="badge-name">{userBadge.badges?.name}</div>
                </div>
            ))}
            {badges.length === 0 && <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No badges earned yet. Keep going!</div>}
        </div>
    );
}

export default BadgeCase;
