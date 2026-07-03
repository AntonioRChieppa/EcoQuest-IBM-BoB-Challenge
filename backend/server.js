const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const sequelize = require('./models/index');
// Import models so Sequelize registers associations before sync
require('./models/User');
require('./models/Quest');

const usersRouter  = require('./routes/users');
const questsRouter = require('./routes/quests');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(morgan('dev'));        // logs: METHOD /path STATUS ms - bytes
app.use(express.json());

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api', usersRouter);
app.use('/api', questsRouter);

// ---------------------------------------------------------------------------
// Boot — sync DB then start server
// ---------------------------------------------------------------------------
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅  Database synced.');
    app.listen(PORT, () => {
      console.log(`🚀  Eco-Quest API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Failed to sync database:', err);
    process.exit(1);
  });
