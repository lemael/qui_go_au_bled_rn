const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

function formatOrder(o) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    adId: o.adId,
    requestId: o.requestId,
    transporterId: o.transporterId,
    transporterName: o.transporter?.fullName ?? '',
    transporterPhotoUrl: o.transporter?.photoUrl ?? null,
    clientId: o.clientId,
    clientName: o.client?.fullName ?? '',
    clientPhotoUrl: o.client?.photoUrl ?? null,
    departureCity: o.departureCity,
    arrivalCity: o.arrivalCity,
    flightDate: o.flightDate,
    pricePerKg: o.pricePerKg,
    status: o.status,
    reviewAuthorized: o.reviewAuthorized,
    cancellationInfo: o.cancellationAuthorId
      ? {
          authorId: o.cancellationAuthorId,
          authorName: o.client?.id === o.cancellationAuthorId ? o.client?.fullName : o.transporter?.fullName,
          reason: o.cancellationReason,
          cancelledAt: o.cancelledAt,
        }
      : undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

const includeRelations = { transporter: true, client: true };

// GET /orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.transportOrder.findMany({
      where: { OR: [{ clientId: req.userId }, { transporterId: req.userId }] },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ orders: orders.map(formatOrder) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.transportOrder.findUnique({
      where: { id: req.params.id },
      include: includeRelations,
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order: formatOrder(order) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /orders/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const existing = await prisma.transportOrder.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const updates = { status };
    if (status === 'COMPLETED') {
      updates.reviewAuthorized = true;
      // Increment transporter's package count
      await prisma.transportAd.update({
        where: { id: existing.adId },
        data: { totalPackagesCarried: { increment: 1 } },
      });
    }

    const order = await prisma.transportOrder.update({
      where: { id: req.params.id },
      data: updates,
      include: includeRelations,
    });
    return res.json({ order: formatOrder(order) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /orders/:id/cancel
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const { reason } = req.body;
  try {
    const existing = await prisma.transportOrder.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const order = await prisma.transportOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        cancellationAuthorId: req.userId,
        cancellationReason: reason ?? '',
        cancelledAt: new Date(),
      },
      include: includeRelations,
    });

    const otherId = order.clientId === req.userId ? order.transporterId : order.clientId;
    await prisma.notification.create({
      data: {
        userId: otherId,
        title: 'Commande annulée',
        body: `La commande ${order.orderNumber} a été annulée`,
        type: 'ORDER_CANCELLED',
        data: { orderId: order.id },
      },
    });

    return res.json({ order: formatOrder(order) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
