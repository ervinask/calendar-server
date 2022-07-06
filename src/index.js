const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/v1/users');
const eventsRoutes = require('./routes/v1/events');

const { port } = require('./config');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send({ msg: 'Server is running' });
});

app.use('/v1/users', userRoutes);
app.use('/v1/events', eventsRoutes);

app.all('*', (req, res) => {
  res.status(404).send({ error: 'Page not found' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
