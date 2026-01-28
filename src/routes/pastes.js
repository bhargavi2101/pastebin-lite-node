const express = require('express');
const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');
const escapeHtml = require('escape-html');
const { getNowMs } = require('../utils/now');

const router = express.Router();

/**
 * CREATE PASTE
 * POST /api/pastes
 */
router.post('/', async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content' });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res.status(400).json({ error: 'Invalid ttl_seconds' });
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res.status(400).json({ error: 'Invalid max_views' });
  }

  const nowMs = getNowMs(req);

  const expiresAt = ttl_seconds
    ? new Date(nowMs + ttl_seconds * 1000)
    : null;

  const paste = await prisma.paste.create({
    data: {
      id: uuidv4(),
      content,
      expiresAt,
      maxViews: max_views ?? null,
    },
  });

  res.json({
    id: paste.id,
    url: `${process.env.BASE_URL}/p/${paste.id}`,
  });
});

/**
 * FETCH PASTE (API)
 * GET /api/pastes/:id
 * Counts as a view
 */
router.get('/:id', async (req, res) => {
  const now = new Date(getNowMs(req));

  const paste = await prisma.paste.findUnique({
    where: { id: req.params.id },
  });

  if (
    !paste ||
    (paste.expiresAt && paste.expiresAt <= now) ||
    (paste.maxViews !== null && paste.viewsUsed >= paste.maxViews)
  ) {
    return res.status(404).json({ error: 'Not found' });
  }

  const updated = await prisma.paste.update({
    where: { id: paste.id },
    data: { viewsUsed: { increment: 1 } },
  });

  res.json({
    content: updated.content,
    remaining_views:
      updated.maxViews === null
        ? null
        : Math.max(updated.maxViews - updated.viewsUsed, 0),
    expires_at: updated.expiresAt,
  });
});

/**
 * HTML VIEW
 * GET /p/:id
 */
async function htmlView(req, res) {
  const now = new Date(getNowMs(req));

  const paste = await prisma.paste.findUnique({
    where: { id: req.params.id },
  });

  if (
    !paste ||
    (paste.expiresAt && paste.expiresAt <= now) ||
    (paste.maxViews !== null && paste.viewsUsed >= paste.maxViews)
  ) {
    return res.status(404).send('Not Found');
  }

  res.send(`
    <html>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `);
}

/**
 * ✅ CORRECT EXPORT SHAPE
 * This is what fixes your error
 */
module.exports = {
  router,
  htmlView,
};
