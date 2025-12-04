const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Cache for stats
let cachedStats = null;
let lastModified = null;

// Calculate stats
async function calculateStats() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  return {
    total: items.length,
    averagePrice: items.length > 0 
      ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length 
      : 0
  };
}

// wach for file changes and invalidate cache
fsSync.watchFile(DATA_PATH, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    cachedStats = null;
    lastModified = null;
  }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await fs.stat(DATA_PATH);
    const currentModified = stats.mtime.getTime();

    // return cached stats if file hasn't changed
    if (cachedStats && lastModified === currentModified) {
      return res.json(cachedStats);
    }

    // Recalculate and cache
    cachedStats = await calculateStats();
    lastModified = currentModified;
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;