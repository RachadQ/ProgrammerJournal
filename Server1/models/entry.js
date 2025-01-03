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
    
// Exclude the `user` field from the response
entrySchema.methods.toJSON = function () {
    const entry = this.toObject();
    delete entry.user; // Remove user field before sending back the response
    return entry;
};

    const Entry = mongoose.model('Entry',entrySchema)
    module.exports = Entry;