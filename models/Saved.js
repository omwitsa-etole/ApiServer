const mongoose = require('mongoose');

const savedSchema = mongoose.Schema({
	booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking',
		
    },
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('saved', savedSchema);