const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

// GET /notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ notifications });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!n || n.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    return res.json({ message: 'Marked as read' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /notifications/read-all
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });
    return res.json({ message: 'All marked as read' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
