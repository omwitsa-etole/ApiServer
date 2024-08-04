const mongoose = require('mongoose');

const withdrawSchema = mongoose.Schema({
	company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },
	payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment'
    },
	amount: {
        type: Number,
       
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('withdraw', withdrawSchema);