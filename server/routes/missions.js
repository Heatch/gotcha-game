const express = require('express');
const router = express.Router();

function getInactiveMissionIds(missions) {
  return missions.filter(m => m.state === 'inactive').map(m => m.id);
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

router.get('/pool', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const missions = req.app.locals.readJSON('missions.json');

  if (user.selection_complete || user.missions.length >= 5) {
    return res.json({ cards: [], selected: user.missions.length, total: 5, complete: true });
  }

  if (user.selection_pool && user.selection_pool.length === 2) {
    const cards = user.selection_pool.map(id => {
      const m = missions.find(mm => mm.id === id);
      return m ? { id: m.id, mission: m.mission } : null;
    }).filter(Boolean);
    if (cards.length === 2) {
      return res.json({ cards, selected: user.missions.length, total: 5, complete: false });
    }
  }

  const inactive = getInactiveMissionIds(missions);
  const picked = pickRandom(inactive, 2);
  user.selection_pool = picked;
  req.app.locals.writeJSON('users.json', users);
  const cards = picked.map(id => {
    const m = missions.find(mm => mm.id === id);
    return { id: m.id, mission: m.mission };
  });
  res.json({ cards, selected: user.missions.length, total: 5, complete: false });
});

router.post('/select', (req, res) => {
  const { name, missionId } = req.body;
  if (!name || !missionId) return res.status(400).json({ error: 'Name and missionId required' });

  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const missions = req.app.locals.readJSON('missions.json');
  const mission = missions.find(m => m.id === missionId);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });
  if (mission.state !== 'inactive') {
    return res.status(409).json({ error: 'Mission already taken' });
  }

  mission.state = 'active';
  user.missions.push({ mission: mission.mission, status: 'open', last_edit: '', gotted: '', comments: '' });
  user.selection_pool = user.selection_pool.filter(id => id !== missionId);

  if (user.missions.length >= 5) {
    user.selection_complete = true;
    user.selection_pool = [];
    req.app.locals.writeJSON('missions.json', missions);
    req.app.locals.writeJSON('users.json', users);
    return res.json({ selected: { id: mission.id, mission: mission.mission }, complete: true });
  }

  const inactiveIds = missions
    .filter(m => m.state === 'inactive' && !user.selection_pool.includes(m.id))
    .map(m => m.id);
  const fresh = pickRandom(inactiveIds, 2);
  user.selection_pool = fresh;
  req.app.locals.writeJSON('missions.json', missions);
  req.app.locals.writeJSON('users.json', users);

  const cards = fresh.map(id => {
    const m = missions.find(mm => mm.id === id);
    return { id: m.id, mission: m.mission };
  });
  res.json({ selected: { id: mission.id, mission: mission.mission }, complete: false, nextPool: cards });
});

router.post('/status', (req, res) => {
  const { name, missionIndex, status, gotted, comments } = req.body;
  if (!name || missionIndex === undefined || !status) {
    return res.status(400).json({ error: 'name, missionIndex, and status required' });
  }
  if (!['failed', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'status must be failed or completed' });
  }

  const users = req.app.locals.readJSON('users.json');
  const userIdx = users.findIndex(u => u.name.toLowerCase() === name.toLowerCase());
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  const user = users[userIdx];
  if (missionIndex < 0 || missionIndex >= user.missions.length) {
    return res.status(400).json({ error: 'Invalid mission index' });
  }

  const mission = user.missions[missionIndex];
  if (mission.status !== 'open') {
    return res.status(409).json({ error: 'Mission already resolved' });
  }

  mission.status = status;
  mission.last_edit = new Date().toISOString();

  if (status === 'completed') {
    mission.gotted = gotted || '';
    mission.comments = comments || '';
    user.score = (user.score || 0) + 1;

    if (gotted && gotted !== 'Group') {
      if (!user.gotted_history) user.gotted_history = [];
      user.gotted_history.push(gotted);
      const otherPlayers = users.filter(u => u.name.toLowerCase() !== name.toLowerCase()).map(u => u.name);
      const allGotted = otherPlayers.every(p => user.gotted_history.includes(p));
      if (allGotted) user.gotted_history = [];
    }

    const io = req.app.locals.io;
    const gotStr = gotted === 'Group' ? 'The group' : (gotted || 'Someone');
    io.emit('chat_message', {
      type: 'system',
      text: `${user.name} completed mission: ${mission.mission}. ${gotStr} was got!`,
      comment: comments || '',
      timestamp: new Date().toISOString()
    });
  } else {
    const io = req.app.locals.io;
    io.emit('chat_message', {
      type: 'system_fail',
      text: `${user.name} failed mission: ${mission.mission}.`,
      timestamp: new Date().toISOString()
    });
  }

  req.app.locals.writeJSON('users.json', users);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

module.exports = router;
