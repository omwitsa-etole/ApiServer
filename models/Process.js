const mongoose = require('mongoose');

const processSchema = mongoose.Schema({
	
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    key:{
        type:String,
    },
    Id:{
        type:Number,
    },
    file:{type:String},
    name:{type:String},
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('process', processSchema);