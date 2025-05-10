import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../users.js';

const JWT_SECRET = 'your_secret_key'; // use env in production

export const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
};
