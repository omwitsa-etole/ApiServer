const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
   
    category: {
        type: String,
    },
	
    description: {
        type: String,
    },
	checked: {
        type: Boolean,
		default: false,
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('notification', notificationSchema);