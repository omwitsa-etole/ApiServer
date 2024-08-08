const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
	previous: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'request'
    },
	title: {
        type: String,
		required: true
    },
    request: {
        type: String,
    },
	response: {
        type: String,
    },
	complete: {
        type: Boolean,
		default: false
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('request', requestSchema);