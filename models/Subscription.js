const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
	tracking_no:{
		type:Number,
		required: true,
	},
    deleted: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment'
    },
	amount: {
        type: Number,
		default: 0
    },
	rate: {
        type: String,
      
    },
	mode:{
		type: String,
	},
	due: {
        type: Date,
        required: true
    },
	complete: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('subscription', subscriptionSchema);