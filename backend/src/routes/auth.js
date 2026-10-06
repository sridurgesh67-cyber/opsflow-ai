const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { getPool, isFallback, inMemoryDb } = require('../db');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_opsflow_jwt_key_2026_agentic';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const { name, email, password } = validated;
    const lowerEmail = email.toLowerCase().trim();

    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    if (usingFallback) {
      const existing = inMemoryDb.users.find(u => u.email.toLowerCase() === lowerEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = {
        id: 'usr_' + uuidv4().substring(0, 8),
        name,
        email: lowerEmail,
        password_hash: passwordHash,
        role: 'operator',
        created_at: new Date().toISOString()
      };
      inMemoryDb.users.push(newUser);

      const secret = process.env.JWT_SECRET || 'super_secret_opsflow_jwt_key_2026_agentic';
      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, secret, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Account registered successfully',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    } else {
      const existingRes = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
      if (existingRes.rows.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = 'usr_' + uuidv4().substring(0, 8);

      const insertRes = await pool.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
        [id, name, lowerEmail, passwordHash, 'operator']
      );
      const user = insertRes.rows[0];

      const secret = process.env.JWT_SECRET || 'super_secret_opsflow_jwt_key_2026_agentic';
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secret, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Account registered successfully',
        token,
        user
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { email, password } = validated;
    const lowerEmail = email.toLowerCase().trim();

    const pool = getPool();
    const usingFallback = isFallback() || !pool;

    let user = null;

    if (usingFallback) {
      user = inMemoryDb.users.find(u => u.email.toLowerCase() === lowerEmail);
    } else {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_opsflow_jwt_key_2026_agentic';
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  router,
  authenticateToken
};
