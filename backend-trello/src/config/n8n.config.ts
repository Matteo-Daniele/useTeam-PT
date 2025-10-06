export default () => ({
  n8n: {
    // URL del webhook de N8N para la exportación
    webhookUrl:
      process.env.N8N_WEBHOOK_URL ??
      'http://localhost:5678/webhook/kanban-export',
    // Timeout de requests al webhook en ms
    timeoutMs: parseInt(process.env.N8N_TIMEOUT_MS ?? '10000', 10),
  },
});
