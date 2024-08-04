const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
	company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true,
    },
    card: {
        type: String,
		required: true,
    },
	cvv: {
        type: String,
    },
	
    expiry: {
        type: String,
		
    },
	type: {
        type: String,
		default:"card",
    },
	identification: {
        type: String,
		
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('payment', paymentSchema);