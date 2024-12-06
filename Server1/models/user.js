//import mongoose
const mongoose = require('mongoose');
const validator =  require('validator');
const bcryptjs =  require('bcryptjs');

//create user schema
const userSchema = new mongoose.Schema
(
    {
        id: { type: String, unique: true, required: true, unique: true},
        firstName:{
            type: String,
            required: [true, 'First name is required'],
        },
        lastName: {
            type:String,
            required: [true,'Last name is Required'],
        },
        email:{
            type: String,
            required: [true,'Email is require'],
            validate: [validator.isEmail, "invalid email"],
            unique:true,
            createIndexes:{unique: true},
    },
    
       password:{
        type: String,
        required: [true, "Password is required"],
        select:false,
       },
       profilePicture:{
        type: String,
       },
       username:{
        type: String,
        unique: true,
        required:true
       }
        
        
    },
    {timestamps:true}
);
// this function will be called after create and secondaly after update
userSchema.pre('save', async function(next)
{
    if(!this.isModified('password'))
    {
        return next();
    }

    try{
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    }catch(err){
        return next(err)
    }
})

userSchema.methods.validatePassword = function(password)
{
    return bcryptjs.compare(password,this.password);
}

// Create the User model
const User = mongoose.model('User', userSchema);



//const User = mongoose.model('Users',userSchema)
module.exports = User;