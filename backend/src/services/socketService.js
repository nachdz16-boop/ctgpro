let io = null;

const setIO = (socketIo) => {
  io = socketIo;
};

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};

const emitGlobal = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = {
  setIO,
  getIO,
  emitToUser,
  emitGlobal,
};
