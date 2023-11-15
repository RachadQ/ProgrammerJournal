//import mongoose
const mongoose = require('mongoose');

//create journal schema
const journalSchema = new mongoose.Schema
(
    {
        id:Number,
        title: String,
        content: String,
        tags: [String]
        
    }
)

const Journal = mongoose.model('journal',journalSchema)
module.exports = Journal;