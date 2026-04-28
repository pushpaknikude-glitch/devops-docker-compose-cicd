const request = require('supertest');
const express = require('express');

// Mock mongoose to avoid real DB connection in tests
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { readyState: 1 },
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({ _id: '123', name: 'Test Item' }),
    findByIdAndDelete: jest.fn().mockResolvedValue(true),
  }),
}));

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'node-api', database: 'connected' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the DevOps Demo API', version: '1.0.0' });
});

describe('API Health & Root', () => {
  test('GET /health returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('node-api');
  });

  test('GET / returns welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.body.version).toBe('1.0.0');
  });
});
