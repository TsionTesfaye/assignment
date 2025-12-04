const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('../items');

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Mock data path - from __tests__ directory
const TEST_DATA_PATH = path.join(__dirname, '../../../../data/items.json');

describe('Items Routes', () => {
  let originalData;

  beforeAll(async () => {
    // Backup original data
    try {
      originalData = await fs.readFile(TEST_DATA_PATH, 'utf8');
    } catch (error) {
      throw new Error(`Could not read test data file at ${TEST_DATA_PATH}: ${error.message}`);
    }
  });

  afterAll(async () => {
    // Restore original data if it was backed up
    if (originalData) {
      await fs.writeFile(TEST_DATA_PATH, originalData, 'utf8');
    }
  });

  describe('GET /api/items', () => {
    it('should return all items with pagination', async () => {
      const res = await request(app)
        .get('/api/items')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should filter items by search query', async () => {
      const res = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(res.body.items.every(item => 
        item.name.toLowerCase().includes('laptop')
      )).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/items?page=1&limit=2')
        .expect(200);

      expect(res.body.items.length).toBeLessThanOrEqual(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by id', async () => {
      const res = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .get('/api/items/99999')
        .expect(404);

      expect(res.body.message || res.text).toContain('not found');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test',
        price: 99.99
      };

      const res = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newItem.name);
      expect(res.body.category).toBe(newItem.category);
      expect(res.body.price).toBe(newItem.price);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidItem = {
        name: 'Test Item'
        // missing category and price
      };

      const res = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(res.body.message || res.text).toContain('required fields');
    });
  });
});

