const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory users array (replace with a database in production)
let users = [];

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// POST /signup - User Registration
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        email,
        password: hashedPassword
    };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
});

// POST /login - User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ auth: true, token });
});

// GET /users - List all users (protected route)
// GET /users - List all users (protected route)
router.get('/users', authenticateToken, (req, res) => {
    // Return users list excluding passwords
    const usersList = users.map(user => ({ id: user.id, email: user.email }));
    res.status(200).json(usersList);
});


// GET /user/:id - View user details by ID (protected route)
router.get('/users/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Return user details excluding the password
    const userDetails = { id: user.id, email: user.email };
    res.status(200).json(userDetails);
});

module.exports = router;
