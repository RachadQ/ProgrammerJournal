//import mongoose
const mongoose = require('mongoose');

//create user schema
const userSchema = new mongoose.Schema
(
    {
        id:{type: Number, unique: true},
        Uname: {type: String, unique: true},
        
    }
)

const User = mongoose.model('user',userSchema)
module.exports = User;