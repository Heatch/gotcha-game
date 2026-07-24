const express = require('express');
const router = express.Router();
const CAP = 360;

function getInactiveMissionIds(missions) {
  return missions.filter(m => m.state === 'inactive').map(m => m.id);
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function successCooldown(n) {
  return Math.min(5 * Math.pow(2, Number(n) || 0), CAP);
}

function failCooldown(n) {
  return Math.min(5 * Math.pow(2, Number(n) || 0), CAP);
}

function countActiveSlots(user) {
  return (user.missions || []).filter(m => m !== null).length;
}

function ensureSlotArrays(user) {
  if (!user.missions || user.missions.length < 5) {
    const current = user.missions || [];
    while (current.length < 5) current.push(null);
    user.missions = current.slice(0, 5);
  }
  if (!user.slot_cooldowns || user.slot_cooldowns.length < 5) {
    const cds = user.slot_cooldowns || [];
    while (cds.length < 5) cds.push(null);
    user.slot_cooldowns = cds.slice(0, 5);
  }
}

router.get('/pool', (req, res) => {
  const { name, refill } = req.query;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  ensureSlotArrays(user);
  const missions = req.app.locals.readJSON('missions.json');
  const isRefill = refill === 'true';

  if (!isRefill && (user.selection_complete || countActiveSlots(user) >= 5)) {
    return res.json({ cards: [], selected: countActiveSlots(user), total: 5, complete: true });
  }

  if (!isRefill && user.selection_pool && user.selection_pool.length === 2) {
    const cards = user.selection_pool.map(id => {
      const m = missions.find(mm => mm.id === id);
      return m ? { id: m.id, mission: m.mission } : null;
    }).filter(Boolean);
    if (cards.length === 2) {
      return res.json({ cards, selected: countActiveSlots(user), total: isRefill ? 1 : 5, complete: false });
    }
  }

  const inactive = getInactiveMissionIds(missions);
  const picked = pickRandom(inactive, 2);
  if (!isRefill) {
    user.selection_pool = picked;
    req.app.locals.writeJSON('users.json', users);
  }
  const cards = picked.map(id => {
    const m = missions.find(mm => mm.id === id);
    return { id: m.id, mission: m.mission };
  });
  res.json({ cards, selected: isRefill ? 0 : countActiveSlots(user), total: isRefill ? 1 : 5, complete: false });
});

router.post('/select', (req, res) => {
  const { name, missionId, refill } = req.body;
  if (!name || !missionId) return res.status(400).json({ error: 'Name and missionId required' });

  const users = req.app.locals.readJSON('users.json');
  const userIdx = users.findIndex(u => u.name.toLowerCase() === name.toLowerCase());
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  const user = users[userIdx];
  ensureSlotArrays(user);

  const missions = req.app.locals.readJSON('missions.json');
  const mission = missions.find(m => m.id === missionId);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });
  if (mission.state !== 'inactive') {
    return res.status(409).json({ error: 'Mission already taken' });
  }

  mission.state = 'active';
  const newMission = { mission: mission.mission, status: 'open', last_edit: '', gotted: '', comments: '' };

  if (refill) {
    const slotIdx = user.missions.findIndex(m => m === null);
    if (slotIdx === -1) return res.status(400).json({ error: 'No empty slot available' });
    user.missions[slotIdx] = newMission;
    req.app.locals.writeJSON('missions.json', missions);
    req.app.locals.writeJSON('users.json', users);
    const { password: _, ...safeUser } = user;
    return res.json({ selected: { id: mission.id, mission: mission.mission }, complete: true, user: safeUser });
  }

  const slotIdx = user.missions.findIndex(m => m === null);
  if (slotIdx !== -1) {
    user.missions[slotIdx] = newMission;
  } else {
    user.missions.push(newMission);
  }
  user.selection_pool = user.selection_pool.filter(id => id !== missionId);

  if (countActiveSlots(user) >= 5) {
    user.selection_complete = true;
    user.selection_pool = [];
    req.app.locals.writeJSON('missions.json', missions);
    req.app.locals.writeJSON('users.json', users);
    const { password: pwd, ...safeUser } = user;
    return res.json({ selected: { id: mission.id, mission: mission.mission }, complete: true, user: safeUser });
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
  const { password: pwd2, ...safeUser2 } = user;
  res.json({ selected: { id: mission.id, mission: mission.mission }, complete: false, nextPool: cards, user: safeUser2 });
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
  ensureSlotArrays(user);

  if (missionIndex < 0 || missionIndex >= user.missions.length) {
    return res.status(400).json({ error: 'Invalid mission index' });
  }

  const mission = user.missions[missionIndex];
  if (!mission || mission.status !== 'open') {
    return res.status(409).json({ error: 'Mission already resolved or empty slot' });
  }

  const now = new Date().toISOString();

  if (!user.wallet) user.wallet = [];
  if (user.success_cooldown_count == null) user.success_cooldown_count = 0;
  if (user.fail_cooldown_count == null) user.fail_cooldown_count = 0;
  user.success_cooldown_count = Number(user.success_cooldown_count);
  user.fail_cooldown_count = Number(user.fail_cooldown_count);
  if (user.completed_count === undefined) user.completed_count = 0;
  user.completed_count = Number(user.completed_count);

  if (status === 'completed') {
    const cooldown = successCooldown(user.success_cooldown_count);
    user.completed_count += 1;
    user.success_cooldown_count += 1;
    user.wallet.push({
      mission: mission.mission,
      status: 'completed',
      timestamp: now,
      gotted: gotted || '',
      comments: comments || ''
    });
    user.slot_cooldowns[missionIndex] = new Date(Date.now() + cooldown * 60000).toISOString();

    if (gotted && gotted !== 'Group') {
      if (!user.gotted_history) user.gotted_history = [];
      user.gotted_history.push(gotted);
      const otherPlayers = users.filter(u => u.name.toLowerCase() !== name.toLowerCase()).map(u => u.name);
      const allGotted = otherPlayers.every(p => user.gotted_history.includes(p));
      if (allGotted) user.gotted_history = [];
    }

    const gotStr = gotted === 'Group' ? 'The group' : (gotted || 'Someone');
    req.app.locals.addChatMessage({
      type: 'system',
      text: `${user.name} completed mission: ${mission.mission}. ${gotStr} was got!`,
      comment: comments || '',
      timestamp: now
    });
  } else {
    const cooldown = failCooldown(user.fail_cooldown_count);
    user.fail_cooldown_count += 1;
    user.wallet.push({
      mission: mission.mission,
      status: 'failed',
      timestamp: now,
      gotted: '',
      comments: ''
    });
    user.slot_cooldowns[missionIndex] = new Date(Date.now() + cooldown * 60000).toISOString();

    req.app.locals.addChatMessage({
      type: 'system_fail',
      text: `${user.name} failed mission: ${mission.mission}.`,
      timestamp: now
    });
  }

  user.score = user.completed_count;
  user.missions[missionIndex] = null;

  req.app.locals.writeJSON('users.json', users);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

router.get('/refill', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const users = req.app.locals.readJSON('users.json');
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  ensureSlotArrays(user);

  const now = Date.now();
  let eligible = false;
  for (let i = 0; i < 5; i++) {
    if (user.missions[i] === null) {
      const cd = user.slot_cooldowns[i];
      if (!cd || new Date(cd).getTime() <= now) {
        eligible = true;
        break;
      }
    }
  }

  res.json({ eligible });
});

module.exports = router;
