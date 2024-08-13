const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
	
	company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company'
    },

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String, 
        unique: true,
    },
    password: {
        type: String,
        
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('mail', mailSchema);