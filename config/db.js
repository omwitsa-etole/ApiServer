const mongoose = require('mongoose');

const db = "mongodb+srv://franciscagatwiri1:ZGhsjDnLRoDJazdo@cluster0.cwr1bxe.mongodb.net/webdocedit?retryWrites=true&w=majority";
//const db = 'mongodb://0.0.0.0:27017/webdocedit';



const connectDB = async () => {
  try {
  await mongoose.connect(db)
  console.log('MongoDB connection established')
  } catch (error) {
    console.log(error.message)
  }
};

module.exports = connectDB;