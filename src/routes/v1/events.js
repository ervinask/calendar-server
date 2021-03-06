const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const { dbConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const { eventsValidation } = require('../../middleware/validation');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
    SELECT id, title, date, startTime, endTime, description FROM events 
    WHERE user_id = ${mysql.escape(req.user.accountId)}`);
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', isLoggedIn, eventsValidation, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);

    if (req.body.startTime > req.body.endTime) {
      await con.end();
      return res.status(500).send({ err: 'End time should be greater than start time' });
    }

    const [data] = await con.execute(
      `INSERT INTO events (title, date, startTime, endTime, description, user_id)
        VALUES (${mysql.escape(req.body.title)},
        ${mysql.escape(req.body.date)},
        ${mysql.escape(req.body.startTime)},
        ${mysql.escape(req.body.endTime)},
        ${mysql.escape(req.body.description)},
        ${mysql.escape(req.user.accountId)})`,
    );

    await con.end();

    return res.send({ msg: 'Good job' });
  } catch (err) {
    console.log(err);
  }
});

router.post('/search', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `SELECT * FROM events WHERE user_id=${req.user.accountId} AND title LIKE ${mysql.escape(
        '%' + req.body.input + '%',
      )}`,
    );
    await con.end();
    if (data.length === 0) {
      return res.send({ err: 'No data found' });
    }
    return res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: 'Server issue occured' });
  }
});

router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `DELETE FROM events WHERE id=${mysql.escape(req.params.id)} and user_id=${mysql.escape(req.user.accountId)}`,
    );
    await con.end();
    if (!data.affectedRows) {
      return res.status(500).send({ err: 'Server issue occured' });
    }
    return res.send({ msg: 'Event successfully deleted' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: 'Server issue occured' });
  }
});

module.exports = router;
