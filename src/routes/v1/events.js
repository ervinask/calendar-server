const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const { dbConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const { eventsValidation } = require('../../middleware/validation');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, 'LABAS123');

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
    SELECT id, title, date, startTime, endTime, description FROM events 
    WHERE user_id = ${mysql.escape(userDetails.accountId)}`);
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', isLoggedIn, eventsValidation, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, 'LABAS123');

  try {
    const con = await mysql.createConnection(dbConfig);

    const [data] = await con.execute(
      `INSERT INTO events (title, date, startTime, endTime, description, user_id)
        VALUES (${mysql.escape(req.body.title)},
        ${mysql.escape(req.body.date)},
        ${mysql.escape(req.body.startTime)},
        ${mysql.escape(req.body.endTime)},
        ${mysql.escape(req.body.description)},
        ${mysql.escape(userDetails.accountId)})`,
    );

    await con.end();

    return res.send({ msg: 'Good job' });
  } catch (err) {
    console.log(err);
  }
});

router.post('/search', isLoggedIn, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, 'LABAS123');

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `SELECT * FROM events WHERE 
      user_id=${userDetails.accountId}
      AND title LIKE ${mysql.escape('%' + req.body.input + '%')}`,
    );
    await con.end();
    if (data.length === 0) {
      return res.send({ err: 'No data found' });
    }
    return res.send(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ err: 'Something wrong with the server.Please try again later' });
  }
});

module.exports = router;
