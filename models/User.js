const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
	phone: {
        type: Number,
        default:254,
    },
    password: {
        type: String,
        required: true,
    },
	premium:{
		type: Boolean,
		default: false
	},
	subscription:{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'subscription'
	},
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('user', UserSchema);