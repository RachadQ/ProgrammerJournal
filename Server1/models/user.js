//import mongoose
const mongoose = require('mongoose');
const validator =  require('validator');
const bcryptjs =  require('bcryptjs');
const crypto = require('crypto');
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
       verificationTokenExpire: {type:Date, // Expiry time for the token
       },
       // Password Reset Fields
    passwordResetToken: {
        type: String,
        select: false, // Don't expose reset token in queries
      },
      passwordResetExpires: {
        type: Date, // Expiry time for the reset token
      },
        
    },
    {timestamps:true}
);
// Method to generate the verification token
userSchema.methods.generateVerificationToken = function () {
    // Create a unique token using crypto
    const token = crypto.randomBytes(32).toString('hex');
    
    // Assign the token and expiration time to the user instance
    this.verificationToken = token;
    this.verificationTokenExpire = Date.now() + 60 * 60 * 1000; // Token expires in 1 hour
    
    // Return the token
    return token;
  };
// this function will be called after create and secondaly after update
userSchema.pre('save', async function(next)
{
    if(!this.isModified('password') )
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

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    // Hash the token and save it in the user document
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
  
    return resetToken;
  };
// Create the User model
const User = mongoose.model('User', userSchema);



//const User = mongoose.model('Users',userSchema)
module.exports = User;