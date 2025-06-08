const mockExec = jest.fn();
const mockPrepare = jest.fn();

const connection = {
  exec: mockExec,
  prepare: mockPrepare
};

module.exports = {
  connection,
  connectDB: jest.fn()
};

// Exportarlos también para configurarlos desde los tests
module.exports.__mockExec = mockExec;
module.exports.__mockPrepare = mockPrepare;
