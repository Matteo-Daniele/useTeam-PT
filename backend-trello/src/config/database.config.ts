export default () => ({
  database: {
    // URI de MongoDB usada por Mongoose
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/kanban-board',
  },
});
