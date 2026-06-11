const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

function formatRequest(r) {
  return {
    id: r.id,
    adId: r.adId,
    transporterId: r.transporterId,
    transporterName: r.ad?.transporter?.fullName ?? '',
    clientId: r.clientId,
    clientName: r.client?.fullName ?? '',
    clientPhotoUrl: r.client?.photoUrl ?? null,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

const includeRelations = { ad: { include: { transporter: true } }, client: true };

// GET /requests — current user's requests (as client or transporter)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.transportRequest.findMany({
      where: { OR: [{ clientId: req.userId }, { transporterId: req.userId }] },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ requests: requests.map(formatRequest) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /requests/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await prisma.transportRequest.findUnique({
      where: { id: req.params.id },
      include: includeRelations,
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    return res.json({ request: formatRequest(request) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /requests
router.post('/', authMiddleware, async (req, res) => {
  const { adId, message } = req.body;
  if (!adId) return res.status(400).json({ error: 'adId is required' });
  try {
    const ad = await prisma.transportAd.findUnique({ where: { id: adId } });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    if (ad.status !== 'active') return res.status(400).json({ error: 'Ad is not active' });

    const request = await prisma.transportRequest.create({
      data: { adId, transporterId: ad.transporterId, clientId: req.userId, message },
      include: includeRelations,
    });

    // Notify the transporter
    await prisma.notification.create({
      data: {
        userId: ad.transporterId,
        title: 'Nouvelle demande',
        body: `Vous avez reçu une nouvelle demande de transport`,
        type: 'NEW_REQUEST',
        data: { requestId: request.id },
      },
    });

    return res.status(201).json({ request: formatRequest(request) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /requests/:id/accept
router.patch('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const r = await prisma.transportRequest.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (r.transporterId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const ad = await prisma.transportAd.findUnique({ where: { id: r.adId } });

    const [request] = await prisma.$transaction([
      prisma.transportRequest.update({ where: { id: r.id }, data: { status: 'ACCEPTED' }, include: includeRelations }),
      prisma.transportOrder.create({
        data: {
          adId: r.adId,
          requestId: r.id,
          transporterId: r.transporterId,
          clientId: r.clientId,
          departureCity: ad.departureCity,
          arrivalCity: ad.arrivalCity,
          flightDate: ad.flightDate,
          pricePerKg: ad.pricePerKg,
          status: 'ACCEPTED',
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: r.clientId,
        title: 'Demande acceptée',
        body: 'Votre demande de transport a été acceptée',
        type: 'REQUEST_ACCEPTED',
        data: { requestId: r.id },
      },
    });

    return res.json({ request: formatRequest(request) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /requests/:id/reject
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const r = await prisma.transportRequest.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (r.transporterId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const request = await prisma.transportRequest.update({
      where: { id: r.id },
      data: { status: 'REJECTED' },
      include: includeRelations,
    });

    await prisma.notification.create({
      data: {
        userId: r.clientId,
        title: 'Demande refusée',
        body: 'Votre demande de transport a été refusée',
        type: 'REQUEST_REJECTED',
        data: { requestId: r.id },
      },
    });

    return res.json({ request: formatRequest(request) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
