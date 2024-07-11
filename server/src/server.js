const express = require('express');
const path = require('path');
const openDb = require('./db/db');
const runMigrations = require('./db/migrationRunner');
const poiRoutes = require('./routes/poi');
const opinionRoutes = require('./routes/opinions');
const inputSanitizer = require('./middleware/inputSanitizer');

const app = express();

//logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(inputSanitizer);

app.use('/api/poi', poiRoutes);
app.use('/api/opinions', opinionRoutes);

app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

async function startServer() {
  const db = await openDb();
  await runMigrations(db);

  app.locals.db = db;

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer().catch(console.error);
