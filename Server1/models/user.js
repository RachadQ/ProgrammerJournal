//import mongoose
const mongoose = require('mongoose');
const validator =  require('validator');
const bcryptjs =  require('bcryptjs');
//create user schema
const userSchema = new mongoose.Schema
(
    {
        email:{
            type: String,
            required: [true,'Email is require'],
            validate: [validator.isEmail, "invalid email"],
            createIndexes:{unique: true},
    },
        username: {
            type:String,
            required: [true,"Username is required"]
        },
       password:{
        type: String,
        required: [true, "Password is required"],
        select:false,
       },
       
        
        
    },
    {timestamps:true}
);
// this function will be called after create and secondaly after update
userSchema.pre('save', async function(next)
{
    if(!this.isModified())
    {
        return next();

    }

    try{
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        return next();
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

const userInstance = new User({ email: '', username: '', password: '' });
userInstance.save()
    .then(savedUser => {
        console.log('User saved:', savedUser);
        // Example usage: Validate password
        savedUser.validatePassword('password')
            .then(isValid => {
                console.log('Password validation result:', isValid);
            })
            .catch(error => {
                console.error('Error validating password:', error);
            });
    })
    .catch(error => {
        console.error('Error saving user:', error);
    });


//const User = mongoose.model('Users',userSchema)
module.exports = User;