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
const cookieParser = require('cookie-parser');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true,
}));

app.use(cookieParser());

//models
const Entry = require(__basedir + '/models/entry');
const User = require(__basedir + '/models/user');
const Tag = require(__basedir + '/models/tag');

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
  try {
    // Skip token validation in test environment (optional)
    /*
    if (process.env.NODE_ENV === 'test') {
      return next(); // Skip authentication for testing
    }
    */

    // Use cookies or Authorization header for token
    const token = req.cookies?.authToken || req.header('Authorization')?.split(' ')[1];

    // If no token is provided, send a 401 error
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    // Verify the JWT token
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        // If the token has expired, return a specific error message
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
       
        // Handle any other JWT errors (e.g., invalid token)
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // If the token is valid, attach the user info to the request object
      req.user = user;
      console.log("user info: " + JSON.stringify(req.user, null, 2));
      next(); // Proceed to the next middleware
    });
  } catch (error) {
    // Catch any other unexpected errors and return a 500 server error
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

//Update profile route
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

      const updatedUser = await User.findOneAndUpdate(
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
router.post('/entrie', authenticateToken, async (req, res) => {
 
  try{
  //Get route to retrieve use and their entries
  const { title, content, tags } = req.body; //for later
    const author = req.user._id;
  if(!title || !content || !tags){
    return res.status(400).json({ message: 'Title, content, and tags are required' });
  }

  // Resolve tag names to _id
  const tagIds = await Promise.all(
    tags.map(async (tagName) => {
      const tagNameTrimmed = tagName.trim();
      let tag = await Tag.findOne({ name: tagNameTrimmed });
      if (!tag) {
        tag = await Tag.create({ name: tagNameTrimmed });
      }
      return tag._id;
    })
  );
  // Create a new entry instance
  const newEntry = new Entry({
    title,
    content,
    tags: tagIds,
    user:author,
  });



    // Save the new entry to the database
    await newEntry.save();

      // Respond with a success message or the newly created entry
      res.status(201).json({ 
        message: 'Journal entry created successfully', 
        entry: newEntry });
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
      on({ message: 'Passwords do not match.' });
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

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }
  
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
    
    // Redirect to the front-end email verification success page
    res.redirect('http://localhost:3000/verify-email?status=success');
  }
  catch(err)
  {
    console.error(error)
     // Redirect to an error page or send an error message
     res.redirect('/verify-email?status=error&message=' + encodeURIComponent(error.message));
  }
}
)

// Verify token route
router.post('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    

    // Assuming you want to return the redirect URL
    const redirectUrl = decodedToken.redirectUrl;
    res.status(200).json({ redirectUrl });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

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

    // Fetch the journal entries for this user by their ObjectId
    const entries = await Entry.find({ user: user._id }).populate('tags').select('-user').exec();

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      username: user.username,
      journalEntries: entries,
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

    // Generate JWT token with redirectUrl in the payload
  const redirectUrl = `/user/${user.username}`;
  if (!redirectUrl) {
    throw new Error('redirectUrl is not defined');  // Custom error to catch this case
  }
  //generate jwt token
  const token = jwt.sign(
    { id: user._id, username: user.username, redirectUrl },
    JWT_SECRET,
    { expiresIn: '1d' }
  );


  const refreshToken = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }  // You can set a longer expiration for refresh tokens
  );


    // Set the userId in a cookie with HttpOnly and Secure flags
    res.cookie(
      'authToken', token, {
      httpOnly: true,  // Prevents JavaScript access to the cookie
      secure: false, //, // Only set Secure flag in production... false for testing
      maxAge: 3600000, // Cookie expiration time (1 hour in milliseconds)
      sameSite: 'none', // Helps prevent CSRF attacks ... secure
      domain: 'localhost', 
      path: '/',
    }
    );
   
    
    

    
       /* // Send the token in the response
        return res.status(200).json({
          message: 'Login successful',
          token, // Send the token to the client
          
        });*/

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
      refreshToken,
      redirectUrl,
    });
  }
  catch(err)
  {
    res.status(500).json({ message: 'An error occurred during login.', error: err.message });
  }
}
)
// Sign out route
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Clear the authToken cookie
    res.clearCookie('authToken', { httpOnly: true, secure: true });

    // Respond with success message
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log out', error: error.message });
  }
});

router.get('/tags/:name', async (req, res) => {
  const tag = await Tag.findOne({ name: req.params.name });
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).json({ message: 'Tag not found' });
  }

});
router.post('/tag', async (req, res) => {
  console.log("Reach");
  console.log("Reached tag creation route");

  const { name } = req.body; // Assuming the tag's name is sent in the body

  if (!name) {
    return res.status(400).json({ message: 'Tag name is required' });
  }

  try {
    // Create a new tag
    const tag = new Tag({ name });

    // Save the tag to the database
    await tag.save();

    // Respond with the newly created tag
    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: 'Error creating tag', error: error.message });
  }
});

// Add this route to handle token refresh
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  // Verify refresh token (you could store refresh tokens in the database for better security)
  jwt.verify(refreshToken, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    // Issue a new access token (and possibly a new refresh token)
    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send the new access token to the client
    res.status(200).json({ accessToken: newAccessToken });
  });
});

app.use(router)


// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

