//import mongoose
const mongoose = require('mongoose');

//create journal schema
const entrySchema = new mongoose.Schema
(
    {
       
        title: String,
        content: String,
        tags: [String],
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',require: true},

    },
    { timestamps: true }
)

const Entry = mongoose.model('Entry',entrySchema)
module.exports = Entry;