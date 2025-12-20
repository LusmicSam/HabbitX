const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '📝'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Optimization: Store completed dates directly on the habit
    // Format: "YYYY-MM-DD"
    completedDates: [{
        type: String
    }]
});

module.exports = mongoose.model('Habit', HabitSchema);
