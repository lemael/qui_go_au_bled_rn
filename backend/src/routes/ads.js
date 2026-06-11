const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

function formatAd(ad) {
  return {
    id: ad.id,
    transporterId: ad.transporterId,
    transporterName: ad.transporter?.fullName ?? '',
    transporterPhotoUrl: ad.transporter?.photoUrl ?? null,
    transporterRating: ad.transporter?.averageRating ?? 0,
    transporterReviews: ad.transporter?.totalReviews ?? 0,
    departureCity: ad.departureCity,
    arrivalCity: ad.arrivalCity,
    flightDate: ad.flightDate,
    flightTime: ad.flightTime,
    maxWeightKg: ad.maxWeightKg,
    pricePerKg: ad.pricePerKg,
    description: ad.description,
    status: ad.status,
    totalPackagesCarried: ad.totalPackagesCarried,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
  };
}

const withTransporter = { transporter: true };

// GET /ads — all active ads
router.get('/', async (req, res) => {
  try {
    const ads = await prisma.transportAd.findMany({
      where: { status: 'active' },
      include: withTransporter,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ads: ads.map(formatAd) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /ads/search
router.get('/search', async (req, res) => {
  const { departureCity, arrivalCity, flightDate } = req.query;
  try {
    const ads = await prisma.transportAd.findMany({
      where: {
        status: 'active',
        ...(departureCity && { departureCity: { contains: departureCity, mode: 'insensitive' } }),
        ...(arrivalCity && { arrivalCity: { contains: arrivalCity, mode: 'insensitive' } }),
        ...(flightDate && { flightDate }),
      },
      include: withTransporter,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ads: ads.map(formatAd) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /ads/my — authenticated user's own ads
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const ads = await prisma.transportAd.findMany({
      where: { transporterId: req.userId },
      include: withTransporter,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ ads: ads.map(formatAd) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /ads/:id
router.get('/:id', async (req, res) => {
  try {
    const ad = await prisma.transportAd.findUnique({
      where: { id: req.params.id },
      include: withTransporter,
    });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    return res.json({ ad: formatAd(ad) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /ads
router.post('/', authMiddleware, async (req, res) => {
  const { departureCity, arrivalCity, flightDate, flightTime, maxWeightKg, pricePerKg, description } = req.body;
  if (!departureCity || !arrivalCity || !flightDate || !flightTime || !maxWeightKg || !pricePerKg) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const ad = await prisma.transportAd.create({
      data: {
        transporterId: req.userId,
        departureCity,
        arrivalCity,
        flightDate,
        flightTime,
        maxWeightKg: Number(maxWeightKg),
        pricePerKg: Number(pricePerKg),
        description: description ?? '',
        status: 'pending',
      },
      include: withTransporter,
    });
    return res.status(201).json({ ad: formatAd(ad) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /ads/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const existing = await prisma.transportAd.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Ad not found' });
    if (existing.transporterId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const ad = await prisma.transportAd.update({
      where: { id: req.params.id },
      data: { status },
      include: withTransporter,
    });
    return res.json({ ad: formatAd(ad) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /ads/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.transportAd.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Ad not found' });
    if (existing.transporterId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.transportAd.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
