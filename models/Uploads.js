const mongoose = require('mongoose');

const uploadSchema = mongoose.Schema({
	
	user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name:{
        type:String,
    },
    task:{
        type:String,
        default:null
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model('upload', uploadSchema);