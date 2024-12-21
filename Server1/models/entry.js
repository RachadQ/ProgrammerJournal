    //import mongoose
    const mongoose = require('mongoose');
    const { Schema } = mongoose; 

    //create journal schema
    const entrySchema = new mongoose.Schema
    (
        {
        
            title: String,
            content: String,
            tags: [{
                type: Schema.Types.ObjectId,
                ref: 'Tag', 
            }],
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',require: true},

        },
        { timestamps: true }
    )

    const Entry = mongoose.model('Entry',entrySchema)
    module.exports = Entry;