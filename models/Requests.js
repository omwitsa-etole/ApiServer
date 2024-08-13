const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({

    tool:{
        type:String,
		required: true,
        
    },

	task: {
		type:String,
	},
	action:{
		type:String,
	},
	
	success:{
		type: Boolean,
		default: false
	},
	
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('request', requestSchema);