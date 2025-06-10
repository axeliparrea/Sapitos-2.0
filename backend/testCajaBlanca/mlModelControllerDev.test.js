const controller = require('../controllers/mlModelControllerDev');
const logger = require('../utils/logger');

jest.mock('../utils/logger');

describe('mlModelControllerDev', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { rol: 'admin' }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('runModelUpdate', () => {
    it('should run mock pipeline for admin user', async () => {
      await controller.runModelUpdate(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('Actualización de modelo iniciada correctamente'),
      }));
    });

    it('should return 403 for non-admin user', async () => {
      req.user.rol = 'cliente';
      await controller.runModelUpdate(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.any(String),
      }));
    });
  });

  describe('getModelUpdateLogs', () => {
    it('should return mock log data for admin', async () => {
      await controller.getModelUpdateLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        logFile: expect.stringMatching(/^weekly_stock_update_dev_/),
        logContent: expect.stringContaining('INFO:'),
      }));
    });

    it('should return 403 for non-admin user', async () => {
      req.user.rol = 'cliente';
      await controller.getModelUpdateLogs(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getNextScheduledUpdate', () => {
    it('should return mock schedule', async () => {
      await controller.getNextScheduledUpdate(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        schedule: expect.objectContaining({
          day: expect.any(String),
          hour: expect.any(String),
          nextRun: expect.any(String),
        }),
      }));
    });
  });

  describe('getModelStatus', () => {
    it('should return random status with timestamp', async () => {
      await controller.getModelStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        status: expect.stringMatching(/active|inactive/),
        lastUpdated: expect.any(String),
      }));
    });
  });

  describe('toggleModelStatus', () => {
    it('should toggle status to active', async () => {
      req.body.status = 'active';
      await controller.toggleModelStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        status: 'active',
      }));
    });

    it('should return 400 for invalid status', async () => {
      req.body.status = 'unknown';
      await controller.toggleModelStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 403 for non-admin user', async () => {
      req.user.rol = 'cliente';
      req.body.status = 'inactive';
      await controller.toggleModelStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getModelMetrics', () => {
    it('should return generated metrics', async () => {
      await controller.getModelMetrics(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        metrics: expect.any(Array),
      }));
    });
  });
});
