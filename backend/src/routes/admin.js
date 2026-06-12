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

// GET /admin/ads/pending
router.get('/ads/pending', async (req, res) => {
  try {
    const ads = await prisma.transportAd.findMany({
      where: { status: 'pending' },
      include: { transporter: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ads });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/ads/:id/approve
router.patch('/ads/:id/approve', async (req, res) => {
  try {
    const ad = await prisma.transportAd.update({
      where: { id: req.params.id },
      data: { status: 'active' },
      include: { transporter: true },
    });
    // Notify the transporter
    await prisma.notification.create({
      data: {
        userId: ad.transporterId,
        title: 'Annonce approuvée',
        body: `Votre annonce ${ad.departureCity} → ${ad.arrivalCity} a été approuvée`,
        type: 'AD_APPROVED',
        data: { adId: ad.id },
      },
    });
    return res.json({ ad });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/ads/:id/reject
router.patch('/ads/:id/reject', async (req, res) => {
  try {
    const ad = await prisma.transportAd.update({
      where: { id: req.params.id },
      data: { status: 'rejected' },
      include: { transporter: true },
    });
    await prisma.notification.create({
      data: {
        userId: ad.transporterId,
        title: 'Annonce refusée',
        body: `Votre annonce ${ad.departureCity} → ${ad.arrivalCity} a été refusée`,
        type: 'AD_REJECTED',
        data: { adId: ad.id },
      },
    });
    return res.json({ ad });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/orders?status=...
router.get('/orders', async (req, res) => {
  const { status } = req.query;
  try {
    const orders = await prisma.transportOrder.findMany({
      where: status ? { status } : undefined,
      include: { transporter: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        transporterId: o.transporterId,
        transporterName: o.transporter?.fullName ?? '',
        clientId: o.clientId,
        clientName: o.client?.fullName ?? '',
        departureCity: o.departureCity,
        arrivalCity: o.arrivalCity,
        flightDate: o.flightDate,
        pricePerKg: o.pricePerKg,
        status: o.status,
        cancellationInfo: o.cancellationAuthorId
          ? {
              authorId: o.cancellationAuthorId,
              authorName:
                o.client?.id === o.cancellationAuthorId
                  ? o.client?.fullName
                  : o.transporter?.fullName,
              reason: o.cancellationReason,
              cancelledAt: o.cancelledAt,
            }
          : undefined,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
    });
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
