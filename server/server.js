const express = require('express')
const db = require('./config/db')

db()
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes')
const skillVectorRoutes = require('./routes/skillVectorRoutes')
const behaviorVectorRoutes = require('./routes/behaviorVectorRoutes')
const opportunityRoutes = require('./routes/opportunityRoutes')
const challangeRoutes = require('./routes/challangeRoutes')
const challangeAttemptRoutes = require('./routes/challangeRoutes')

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/skillVector', skillVectorRoutes);
app.use('/api/behaviorVector', behaviorVectorRoutes);
app.use('/api/opportunityRoutes', opportunityRoutes);
app.use('/api/challangeRoutes', challangeRoutes);
app.use('/api/challangeAttemptRoutes', challangeAttemptRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
  });
});

module.exports = app;
