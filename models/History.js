const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
	booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    },
	deleted: {
        type: Boolean,
        default:  false
    },
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('history', historySchema);