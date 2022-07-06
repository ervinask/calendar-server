const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { dbConfig } = require('../../config');
const {
  registrationValidation,
  loginValidation,
} = require('../../middleware/validation');

const router = express.Router();

router.post(`/register`, registrationValidation, async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    const con = await mysql.createConnection(dbConfig);

    const [data] = await con.execute(
      'INSERT INTO `users` (email, name, password)' +
        `VALUES (${mysql.escape(req.body.email)},
        ${mysql.escape(req.body.name)},
        ${mysql.escape(hash)}
    )`,
    );

    await con.end();

    if (!data.insertId) {
      return res.status(500).send({
        err: 'Something went wrong with the server. Please try again later',
      });
    }

    return res.send({
      msg: 'Successfully created an account ',
      accountId: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      err: 'Something went wrong with the server. Please try again later',
    });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      'SELECT id, email, password FROM `users`' +
        `WHERE email = ${mysql.escape(req.body.email)} LIMIT 1    `,
    );

    await con.end();

    if (data.length === 0) {
      return res.status(404).send({ err: 'User not found' });
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      return res.status(404).send({ err: 'Incorrect password' });
    }

    const token = jwt.sign({ accountId: data[0].id }, 'LABAS123');
    console.log(token);

    return res.send({
      msg: 'User successfully logged in',
      token,
    });
  } catch (err) {
    return res.status(500).send({ err: 'A server issue occured' });
  }
});

module.exports = router;
