export default () => ({
  app: {
    // Puerto donde corre Nest; por defecto 3000 si no hay PORT
    port: parseInt(process.env.PORT ?? '3000', 10),
    // Origen permitido para CORS en dev (frontend Vite por defecto)
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
});
