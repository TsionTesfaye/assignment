const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dbMongooseKit = require('database-mongoose-kit');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const { notFound } = require('./middleware/errorHandler');
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(dbMongooseKit());

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

app.listen(port, () => console.log('Backend running on http://localhost:' + port));