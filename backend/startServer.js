
function startServer(app, PORT, closeDatabase) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });

  const shutdown = (code) => {
    server.close(async () => {
      console.log('📴 Closing server...');
      try {
        await closeDatabase();
        console.log('✅ Graceful shutdown complete.');
        process.exit(code);
      } catch (err) {
        console.error('❌ Shutdown failed:', err);
        process.exit(1);
      }
    });
  };

  // Signals
  process.on('SIGINT', () => {
    console.log('📴 SIGINT received.');
    shutdown(0);
  });

  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received.');
    shutdown(0);
  });

  // Unhandled errors
  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    shutdown(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    shutdown(1);
  });
}

module.exports = startServer;
