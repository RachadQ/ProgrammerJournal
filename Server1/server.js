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
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');

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
      
      next(); // Proceed to the next middleware
    });
  } catch (error) {
    // Catch any other unexpected errors and return a 500 server error
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get user information route
router.get('/user-info', authenticateToken, async (req, res) => {
  try {
    const user = req.user;  // User info is attached after successful authentication
    
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user info (e.g., userId)
    res.status(200).json({
      _id: user.id,  // Send the userId back to the frontend
      username: user.username,  // You can also return the username or other relevant data
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
    const author = req.user.id;
   
  if(!title || !content || !tags){
    return res.status(400).json({ message: 'Title, content, and tags are required' });
  }

  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags should be an array' });
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
router.get('/user/:username', async (req,res) =>{

 
  const {username} = req.params;
  const{page = 1, limit = 5} = req.query;
  
  try {
   
   // Fetch the user by username
   const user = await User.findOne({ username });

   
    //if user not found
    if(!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the journal entries for this user by their ObjectId
    const journalEntries = await Entry.find({ user: user._id })
      .populate('tags', 'name _id') // Populate tags within journal entries
      .skip((page-1)* limit)
      .limit(Number(limit))
      .exec();
    
    
    // Fetch the journal entries for this user by their ObjectId
    const totalEntries = await Entry.countDocuments({ user: user._id });
   
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      username: user.username,
      journalEntries: journalEntries,
      totalEntries,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      user: user.user,
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
   

     // Generate session token
     const sessionToken = user.generateSessionToken();

     // Save session token to the user document
    await user.save();
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
      sessionToken,
    });
  }
  catch(err)
  {
    res.status(500).json({ message: 'An error occurred during login.', error: err.message });
  }
}
)

router.post('/forgot-password',async(req,res) =>
{
  
  try{
    const {email} = req.body;

    //validate the email fields
    if(!email)
    {
      return res.status(400).json({ message: 'Email is required' });
    }

    //check if the user exists by email
    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    // Generate a password reset token using the method defined in the User schema
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create the password reset link
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 587,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    };

     // Send the email
     await transporter.sendMail(mailOptions);
     res.status(200).json({
      message: 'Password reset link sent to your email',
    });
  }
  catch(err)
  {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }


})
// Sign out route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear the authToken cookie
    res.clearCookie('authToken', { httpOnly: true, secure: true });

    // Respond with success message
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log out', error: error.message });
  }
});

//Delete journal entry
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the journal entry by its ID
    const deletedEntry = await Entry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
})
router.get('/tag/:name', async (req, res) => {
  const tag = await Tag.findOne({ name: req.params.name });
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).json({ message: 'Tag not found' });
  }

});

router.get('/tags/search', async (req, res) => {
 
  const query = req.query.query || ''; // Get the query from the request
  try {
    const tags = await Tag.find({ name: { $regex: query, $options: 'i' } }).limit(10); // Search for tags matching query
    res.json(tags);
  } catch (error) {
    res.status(500).send('Error fetching tags');
  }
});
router.post('/tag', async (req, res) => {
  
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

app.get('/get/tags', authenticateToken, async (req,res) =>
{
  console.log("Reach tag");
  const userId = req.user.id;
  
  try {

    //get all tags from database that has the req.user.id
    const entries = await Entry.find({ user: userId }).select('tags');
  //  const userId = req.user.id; // Assuming user ID is available in the request

  //extract all tags
  const tagIds = [...new Set(entries.flatMap(entry => entry.tags))]
   // Fetch tag details from the Tag collection
   const tags = await Tag.find({ _id: { $in: tagIds } });
  console.log(tags);
  if (tags.length === 0) {
    return res.status(404).json({ message: 'No tags found for this user' });
  }
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: 'Internal server error' });
    console.log(err);
  }
});
// Reset password route
router.post('/reset-password', async (req, res) => {
  
  try {
    const { token, newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find the user by the reset token and check if the token is still valid
    const user = await User.findOne({
      passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
      passwordResetExpires: { $gt: Date.now() }, // Check if the token is expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log("Before " + user.password)
     // Update the user's password directly
    user.password = newPassword;  // No need to hash manually, the pre-save hook will handle this
    console.log("after " + user.password)
    // Clear the reset token and expiration time
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Save the user with the new password (the password will be hashed by the pre-save hook)
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});


//Route to edit an existing journal entry
router.put("/edit/:id",authenticateToken, async (req,res) =>
{
  console.log("Reach");
  const { id } = req.params;
  const { title, content, tags,userId } = req.body;

  try {
    // Validate tags format
    if (tags && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string"))) {
      return res.status(400).json({ message: "Invalid tags format. Tags must be an array of strings." });
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


    // Find the journal entry
    const entry = await Entry.findById(id);
    console.log("entry1:" +  entry);
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
   
    console.log("Users " + entry.user + "  " + req.user.id );
    // Check user authorization
    if (String(entry.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "You are not authorized to edit this entry" });
    }

    console.log("Reach");
    console.log("entry1:" +  entry);
    
    // Update entry fields
    entry.title = title || entry.title;
   
    entry.content = content || entry.content;
    entry.tags = tagIds;
    entry.updatedAt = new Date();
    console.log("entry 2 reach:" +  entry);
   
    // Save the updated entry
    await entry.save();

    res.status(200).json({ message: "Journal entry updated successfully", entry });
  } catch (err) {
    console.error("Error updating journal entry:", err.message);
    res.status(500).json({ message: "Error updating journal entry", error: err.message });
  }
}
)

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

