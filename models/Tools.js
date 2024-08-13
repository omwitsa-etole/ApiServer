const mongoose = require('mongoose');

const toolSchema = mongoose.Schema({
	
    name:{
        type:String,
		required: true,
        unique: true
    },
    tool:{
        type:String,
		required: true,
        unique: true
    },
	title:{
		type:String,
		required: true
	},
	svg:{
		type:String,
	},
	description:{
		type:String,
	},
	category:{
		type:String,
	},
	task: {
		type:String,
	},
	action:{
		type:String,
	},
	active:{
		type:Boolean,
		default: true
	},
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('tool', toolSchema);