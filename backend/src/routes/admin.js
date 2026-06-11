const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// GET /admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalAds, totalOrders, totalRequests, totalReviews] = await Promise.all([
      prisma.user.count(),
      prisma.transportAd.count(),
      prisma.transportOrder.count(),
      prisma.transportRequest.count(),
      prisma.review.count(),
    ]);
    return res.json({ stats: { totalUsers, totalAds, totalOrders, totalRequests, totalReviews } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ users: users.map(({ password, ...u }) => u) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/ads
router.get('/ads', async (req, res) => {
  try {
    const ads = await prisma.transportAd.findMany({
      include: { transporter: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ads });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.transportOrder.findMany({
      include: { transporter: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ orders });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: 'User deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /admin/ads/:id
router.delete('/ads/:id', async (req, res) => {
  try {
    await prisma.transportAd.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Ad deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
