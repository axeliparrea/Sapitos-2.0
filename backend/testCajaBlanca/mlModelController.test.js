// testCajaBlanca/mlModelController.test.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

jest.mock('../services/stockUpdateScheduler', () => ({
  runPipelineNow: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warning: jest.fn()
}));

const controller = require('../controllers/mlModelController');
const { runPipelineNow } = require('../services/stockUpdateScheduler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('mlModelController', () => {
  const testDir = path.join(__dirname, '..', 'mlops');

  beforeAll(() => {
    fs.mkdirSync(`${testDir}/config`, { recursive: true });
    fs.writeFileSync(`${testDir}/config/model_status.json`, JSON.stringify({
      status: 'active',
      lastUpdated: '2024-06-01T10:00:00Z'
    }));

    fs.writeFileSync(`${testDir}/config/stock_update_config.py`, `
      SCHEDULE_DAY = 1
      SCHEDULE_HOUR = 1
      SCHEDULE_MINUTE = 0
    `);

    fs.writeFileSync(`${testDir}/config/model_metrics.json`, JSON.stringify({
      training: [
        { date: "2025-12-01", mae: 10.691581726074219 },
        { date: "2025-12-01", mae: 10.691581726074219 },
        { date: "2025-12-01", mae: 10.691581726074219 },
        { date: "2025-12-01", mae: 10.691581726074219 }
      ],
      test: [
        { date: "2025-12-01", mae: 10.607094764709473 },
        { date: "2025-12-01", mae: 10.607094764709473 },
        { date: "2025-12-01", mae: 10.607094764709473 },
        { date: "2025-12-01", mae: 10.607094764709473 }
      ]
    }));

    fs.mkdirSync(`${testDir}/logs`, { recursive: true });
    fs.writeFileSync(`${testDir}/logs/weekly_stock_update_2024-06-01.log`, 'Pipeline log here...');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('runModelUpdate should run pipeline for admin user', async () => {
    const req = { user: { rol: 'admin' } };
    const res = mockRes();

    await controller.runModelUpdate(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(runPipelineNow).toHaveBeenCalled();
  });


  it('getNextScheduledUpdate should return correct schedule', async () => {
    const req = {};
    const res = mockRes();

    await controller.getNextScheduledUpdate(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      schedule: expect.objectContaining({
        day: expect.any(String),
        hour: '1:00',
        nextRun: expect.any(String)
      })
    }));
  });

  it('getModelStatus should return active status if logs exist', async () => {
    const req = { user: { rol: 'admin' } };
    const res = mockRes();

    await controller.getModelStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      status: 'active',
      lastUpdated: expect.any(String)
    }));
  });

  it('toggleModelStatus should update model status', async () => {
    const req = {
      user: { rol: 'admin' },
      body: { status: 'inactive' }
    };
    const res = mockRes();

    await controller.toggleModelStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      status: 'inactive'
    }));
  });

  it('getModelMetrics should return training and test arrays', async () => {
    const req = {};
    const res = mockRes();

    await controller.getModelMetrics(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      training: expect.arrayContaining([
        expect.objectContaining({ date: expect.any(String), mae: expect.any(Number) })
      ]),
      test: expect.arrayContaining([
        expect.objectContaining({ date: expect.any(String), mae: expect.any(Number) })
      ])
    }));
  });
});
