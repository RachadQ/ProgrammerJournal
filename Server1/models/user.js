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
       },

       journalEntries: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Entry',
       }],
       //Email Verification fieldds
       isVerified:{
        type:Boolean,
        default:false,
       },
       verificationToken:{
        type:String,
        select:false,
       },
       verificationTokenExpire: Date, // Expiry time for the token
        
        
    },
    {timestamps:true}
);
userSchema.method.generateVerificationToken = function () {
//create a unqiue token
const token = crypto.randomBytes(32).toString('hex');
this.verificationToken = token;
//make token expire in 1 hour
this.verificationTokenExpire = Date.now() + 60 * 60 * 1000; 
return token;

};
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

//compare the provided password with the hashed password
userSchema.methods.comparePassword = function(password){
    return bcryptjs.compare(password,this.password);
}

// Create the User model
const User = mongoose.model('User', userSchema);



//const User = mongoose.model('Users',userSchema)
module.exports = User;