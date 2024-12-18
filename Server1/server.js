global.__basedir = __dirname;
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Route } = require('react-router-dom');
const nodemailer = require('nodemailer');
const router = new express.Router()
// ADD THIS
const cors = require('cors');

const usersController = require("./controller/users")
// get config
const config = require(__basedir + '/config')
const {
  PORT: port,
} = config
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET
const app = express();
// connect to the database
require(__basedir + '/helpers/mongoose')
app.use(express.json())
app.use('/api', router);

// Configure body-parser to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// Custom CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
}));

//models
const Entry = require(__basedir + '/models/entry');
const User = require(__basedir + '/models/user');

//generate a unique Username
function generateUsername(firstName, lastName)
{
   // Create a base username from first and last name
   const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
   // Add a random number to make it unique
  const randomNumber = Math.floor(Math.random() * 10000);

  // Combine base username with random number
  return `${baseUsername}${randomNumber}`;
}

function generateUniqueId() {
  return Math.random().toString(30).substr(2, 9); // Generates a random alphanumeric string
}


//JWT Authentication Middleware
const authenticateToken = (req,res,next) =>
{
   // Skip token validation in test environment
   if (process.env.NODE_ENV === 'test') {
    return next(); // Skip authentication for testing
  }

  const authHeaderTest = req.headers['authorization']; 
 // const authHeader = req.headers.authenticateToken;
  const token = authHeaderTest && authHeaderTest.split(' ')[1];

  if(!token) return res.status(401).json({message: 'Token is required'});

  jwt.verify(token.JWT_SECRET,(err,user) =>{
  //  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) return res.status(403).json({message: 'Invalid or expired token'});
    req.user = user;
    next();
  })
}

//RUpdate profile route
router.put('/profile/:username',authenticateToken,async(req,res)=>
{
  try{
    //extract username from URL
    const usernameParam = req.params.username;
    const { username: tokenUsername } = req.user; // Username from the token
    const updates = req.body;

    
      // Ensure the authenticated user is the one updating the profile
      if (usernameParam !== tokenUsername) {
        return res.status(403).json({ message: 'You can only edit your own profile' });
      }

      const updatedUser = await findOneAndUpdate(
        { username: usernameParam }, 
        updates, 
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

        // Respond with the updated user info
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  }
  catch(err)
  {
    res.status(500).json({ message: 'An error occurred during profile update.', error: err.message });

  }
}
)

//create a new journal entry
router.get('/entries', authenticateToken, async (req, res) => {
 
  try{
  //Get route to retrieve use and their entries
  const { title, content, tags } = req.body; //for later

  if(!title || !content || !tags){
    return res.status(400).json({ message: 'Title, content, and tags are required' });
  }
  // Create a new entry instance
  const newEntry = new Entry({
    title,
    content,
    tags,
    user:userId,
  });

    // Save the new entry to the database
    await newEntry.save();

      // Respond with a success message or the newly created entry
      res.status(201).json({ message: 'Journal entry created successfully', entry: newEntry });
    } catch (error) {
      // Handle any errors that occur during the creation process
      res.status(500).json({ message: 'Failed to create journal entry', error: error.message });
  }
})

//create a new User 
router.post('/user/signUp', async(req,res) => {
  try {
  
    const {firstName, lastName, email, password,confirmPassword, profilePicture} = req.body;
   
    //validate required fields
    if(!firstName || !lastName || !email || !password || !confirmPassword)
    {
      return res.status(400).json({message: 'First name, Last name, email, and password are required.'})
    }
    
     // Check if passwords match (but don't store confirmPassword in the model)
     if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    //Validate email format
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please use a valid email address.' });
    }
    //check if the email is already in use
    const existingUser = await User.findOne({email});
    if(existingUser)
    {
      return res.status(400).json({message: 'Email is already in use.'})
      
    }

    // Check if the username is already in use
     let username = generateUsername(firstName,lastName);
      while (await User.findOne({ username })) {
      username = generateUsername(firstName, lastName);
    }

    //Create a new user instance
    const newUser = new User(
      {id:generateUniqueId(),
        firstName, 
        lastName,
        email,
        password,
        profilePicture,
        username,
      }
    );

    //Gnerate verification token
    const verificationToken = newUser.generateVerificationToken();

    // save the user to the database
    const savedUser = await newUser.save();

    /* real
    //send email verificattion link
    const transporter = nodemailer.createTransport(
      {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    )*/
    //testing
      const transporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 587,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      });

    const mailOptions = {
      from:process.env.EMAIL_USER,
      to:email,
      subject: 'Email Verification',
      html: `<p>Click <a href="http://localhost:3001/verify-email?token=${verificationToken}">here</a> to verify your email.</p>`,
    }

    await transporter.sendMail(mailOptions);

    //Respond with the saved User
    res.status(201).json(
      {
        message: 'User created successfully',
        user:{
          id:savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          profilePicture: savedUser.profilePicture,
          username: savedUser.username,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        }
      }
    )
  }
  catch(err)
  {
    console.error(err);
        res.status(500).json({ message: 'An error occurred while creating the user.', error: err.message });
}
})

//Email Verification EndPoint
router.get('/verify-email', async(req,res) =>
{
 
  const {token} = req.query;
  console.log(token);
  try{
    //find user by verification token
    const user = await User.findOne({verificationToken: token}).select('+verificationToken');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    //mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined; //clear the token
    await user.save();
    
  }
  catch(err)
  {
    console.error(error)
    res.status(500).json({message: 'Error verifying email.', error: error.message})
  }
}
)

//get user by username
router.get('/user/:username', authenticateToken, async (req,res) =>{

  const {username} = req.params;

  try {
   
    //find user by username
    const user = await User.findOne({username}).populate('journalEntries').select('-password');
   
    //if user not found
    if(!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      username: user.username,
      journalEntries: user.journalEntries,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
  });
  
  } catch (error) {
    console.error("Error fetching user by username:", error.message, error.stack);
    return res.status(500).json({ message: 'Server Error' });
  }
}
);

//login route
router.post('/login',async (req,res) =>
{
  
  try{
    const {email,password} = req.body;
    
    //valuate required field
    if(!email || !password)
    {
      return res.status(400).json({message: 'Email and password are required'})
    }

    //check if the user exists by email
    const user = await User.findOne({email}).select('+password');

    if(!user)
    {
      return res.status(400).json({message: 'invalid credentials'});

    }

     // Check if the user's email is verified
     if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email to activate your account.' });
    }

    //compare the provided password with the stored hashed password
    const isPasswordMatch = await user.comparePassword(password);
    
    if(!isPasswordMatch)
    {
      return res.status(400).json({message: 'Invalid credentials'})
    }

    //generate JWT token
    const token = jwt.sign({id: user._id,username: user.username},JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

        // Send the token in the response
        return res.status(200).json({
          message: 'Login successful',
          token, // Send the token to the client
        });

     // Respond with the user info and token
     res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token, // Send the JWT token to the client
    });
  }
  catch(err)
  {
    res.status(500).json({ message: 'An error occurred during login.', error: err.message });
  }
}
)
app.use(router)


// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

