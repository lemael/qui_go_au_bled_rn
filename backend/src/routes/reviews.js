const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

function formatReview(r) {
  return {
    id: r.id,
    orderId: r.orderId,
    transporterId: r.transporterId,
    clientId: r.clientId,
    clientName: r.client?.fullName ?? '',
    clientPhotoUrl: r.client?.photoUrl ?? null,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}

// GET /reviews/transporter/:transporterId
router.get('/transporter/:transporterId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { transporterId: req.params.transporterId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ reviews: reviews.map(formatReview) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /reviews
router.post('/', authMiddleware, async (req, res) => {
  const { orderId, rating, comment } = req.body;
  if (!orderId || !rating) return res.status(400).json({ error: 'orderId and rating are required' });
  try {
    const order = await prisma.transportOrder.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.reviewAuthorized) return res.status(400).json({ error: 'Review not authorized for this order' });
    if (order.clientId !== req.userId) return res.status(403).json({ error: 'Only the client can leave a review' });

    const existing = await prisma.review.findFirst({ where: { orderId, clientId: req.userId } });
    if (existing) return res.status(409).json({ error: 'Review already submitted' });

    const review = await prisma.review.create({
      data: { orderId, transporterId: order.transporterId, clientId: req.userId, rating: Number(rating), comment: comment ?? '' },
      include: { client: true },
    });

    // Update transporter's average rating
    const reviews = await prisma.review.findMany({ where: { transporterId: order.transporterId } });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.user.update({
      where: { id: order.transporterId },
      data: { averageRating: Math.round(avg * 10) / 10, totalReviews: reviews.length },
    });

    return res.status(201).json({ review: formatReview(review) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
