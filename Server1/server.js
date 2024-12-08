global.__basedir = __dirname;
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Route } = require('react-router-dom');
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

function generateUniqueId() {
  return Math.random().toString(30).substr(2, 9); // Generates a random alphanumeric string
}
router.get('/user', async(req, res) => {
 res.send("hello");
})


//middleware to verify JWT token
const authenticateToken = (req,res,next) =>
{
  const authHeader = req.headers.authenticateToken;
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.status(401).json({message: 'Token is required'});

  jwt.verify(token,JWT_SECRET,(err,user) =>{
    if(err) return res.status(403).json({message: 'Invalid or expired token'});
    req.user = user;
    next();
  })
}

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
router.get('/entriess', async (req, res) => {
 
  try{
  //Get route to retrieve use and their entries
 // const { id, title, content, tags, userId } = req.body; //for later

  // Create a new entry instance
  const newEntry = new Entry({
    title: 'Hardcoded Title',
    content:'This is a hardcoded content for a journal entry.',
    tags: ['test', 'example'],
    user: '65578f76db21b6112159cc40' // Assuming userId is provided in the request
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
router.post('/users', async(req,res) => {
  try {
  
    const {firstName, lastName, email, password, profilePicture} = req.body;
   
    //validate required fields
    if(!firstName || !lastName || !email || !password)
    {
      return res.status(400).json({message: 'First name, Last name, email, and password are required.'})
    }
    
    //check if the email is already in use
    const existingUser = await User.findOne({email});
    if(existingUser)
    {
      return res.status(400).json({message: 'Email is already in use.'})
      
    }
      // Check if the username is already in use
     let username = generateUsername(firstName,lastName);
      let existingUsername = await User.findOne({username});
     //check if generated username already exists in the database
     while(existingUsername)
     {
      //if the username exists, regenerate the username with a new random number
      username = generateUsername(firstName,lastName);
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

    // save the user to the database
    const savedUser = await newUser.save();

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
router.get('/user/:username', async (req,res) =>{

  try {
    const {username} = req.params;
   
    //find user by username
    const user = await User.findOne({Uname: username});
   
    //if user not found
    if(!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }
    const entries = await Entry.find({ user: user._id })
     //Find all entries associated with the user object ID
   //  const entries = await Entry.find({ user: user._id }).populate('user')
   

    //Return user and their entries
  
    return res.status(200).send({user,entries});
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
}
);


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
  
    // Ensure user has a password in the database
    if (!user.password) {
        console.error('Password not found for user:', user);
        return res.status(500).json({ message: 'User password is missing in the database.' });
    }

    if(!user)
    {
      return res.status(400).json({message: 'invalid credentials'});

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

