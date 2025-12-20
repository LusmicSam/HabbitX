const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    earnedBadges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }]
});

module.exports = mongoose.model('Profile', ProfileSchema);
