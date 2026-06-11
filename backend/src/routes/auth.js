const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function makeToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

function safeUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName, phone, address } = req.body;
  if (!email || !password || !fullName || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, fullName, phone, address },
    });
    const token = makeToken(user);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = makeToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  // In production, send an email. Here we just acknowledge.
  return res.json({ message: 'If this email exists, a reset link was sent.' });
});

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const { fullName, phone, address, photoUrl, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(photoUrl && { photoUrl }),
        ...(role && { role }),
      },
    });
    return res.json({ user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
