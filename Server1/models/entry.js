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
            ref:'user',
        }
    }
)

const Entry = mongoose.model('entries',entrySchema)
module.exports = Entry;