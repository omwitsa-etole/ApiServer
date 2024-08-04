const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
	company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },
	
	parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parking'
    },
	
	booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
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
    },
	rate: {
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

module.exports = mongoose.model('invoice', invoiceSchema);