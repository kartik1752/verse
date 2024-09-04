const express = require('express');
const cors = require('cors');
const app = express();
const userModel = require('./Model/user');
const bcrypt = require('bcrypt');

app.use(express.json()); // Important: Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update this to match your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow credentials if needed
}));

// Route to handle form submission
app.post('/blog/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return res.status(500).json({ message: 'Server Error' });
      }
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).json({ message: 'Server Error' });
        }
        try {
          let createdUser = await userModel.create({
            name: name,
            email: email,
            password: hash // Using the hashed password
          });
          return res.status(201).json({ message: 'User created successfully', user: createdUser });
        } catch (error) {
          return res.status(500).json({ message: 'Server Error' });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
});

// Route to handle user login
app.post('/blog/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findOne({ email: email });
    
    
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please sign up.' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ message: 'Login successful',name:user.name });
    } else {
      return res.status(404).json({ message: 'Password is incorrect' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Backend server is running on http://localhost:3000');
});
