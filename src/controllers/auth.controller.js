const userModel = require('../models/users.models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {
  const { username, email, password, role = 'user' } = req.body;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userModel({
    username,
    email,
    password: hashedPassword,
    role,
  });

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.cookie('token', token);

  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
}

async function loginUser(req, res) {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid Credentials',
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: 'Invalid Credentials',
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: 'Login successful',
    token,
  });
}

function logoutUser(req, res) {
  // Clear auth cookie
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
