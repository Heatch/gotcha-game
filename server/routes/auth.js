const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post('/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.json({ success: false, message: 'Please enter both name and password.' });
  }
  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Incorrect name or password.' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

module.exports = router;
