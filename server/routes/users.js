const express = require('express');
const router = express.Router();

router.get('/names', (req, res) => {
  const users = req.app.locals.readJSON('users.json');
  const names = users.map(u => ({
    name: u.name,
    pseudonym: u.pseudonym || u.name,
    score: u.completed_count || 0
  }));
  res.json(names);
});

module.exports = router;
