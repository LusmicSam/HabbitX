const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    icon: String,
    condition: String // e.g. "streak_7"
});

module.exports = mongoose.model('Badge', BadgeSchema);
