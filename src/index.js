require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const pasteRoutes = require('./routes/pastes');
const uiRoutes = require('../src/routes/ui');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', uiRoutes);
app.use('/api/healthz', healthRoutes);
app.use('/api/pastes', pasteRoutes.router);
app.get('/p/:id', pasteRoutes.htmlView);

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running`);
  });
}

module.exports = app;