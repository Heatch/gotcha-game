const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

let db;
try {
  db = new Firestore();
} catch (err) {
  db = null;
}

let usersCache = [];
let missionsCache = [];
let chatCache = [];

const dataDir = path.join(__dirname, 'data');

async function init() {
  try {
    await initInternal();
  } catch (err) {
    console.error('Critical init error:', err.message);
    loadLocalFiles();
  }
}

async function initInternal() {
  if (!db) {
    loadLocalFiles();
    return;
  }

  try {
    const usersDoc = await db.collection('game').doc('users').get();
    if (usersDoc.exists) {
      usersCache = usersDoc.data().data;
      missionsCache = (await db.collection('game').doc('missions').get()).data().data;
      const chatDoc = await db.collection('game').doc('chat').get();
      chatCache = chatDoc.exists ? chatDoc.data().messages : [];
      console.log('Loaded data from Firestore');
    } else {
      loadLocalFiles();
      await db.collection('game').doc('users').set({ data: usersCache });
      await db.collection('game').doc('missions').set({ data: missionsCache });
      await db.collection('game').doc('chat').set({ messages: chatCache });
      console.log('Seeded Firestore from local data');
    }
  } catch (err) {
    console.error('Firestore init error, using local files:', err.message);
    loadLocalFiles();
  }
}

function parseJSONFile(filename) {
  const raw = fs.readFileSync(path.join(dataDir, filename), 'utf8');
  const sanitized = raw.replace(/^\uFEFF/, '');
  return JSON.parse(sanitized);
}

function loadLocalFiles() {
  console.log('Loading data from local files');
  usersCache = parseJSONFile('users.json');
  missionsCache = parseJSONFile('missions.json');
  try {
    chatCache = parseJSONFile('chat.json');
  } catch {
    chatCache = [];
  }
}

function readJSON(filename) {
  const name = path.basename(filename, '.json');
  if (name === 'users') return JSON.parse(JSON.stringify(usersCache));
  if (name === 'missions') return JSON.parse(JSON.stringify(missionsCache));
  if (name === 'chat') return JSON.parse(JSON.stringify(chatCache));
  throw new Error(`Unknown data file: ${filename}`);
}

function writeJSON(filename, data) {
  const name = path.basename(filename, '.json');
  const cloned = JSON.parse(JSON.stringify(data));

  if (name === 'users') {
    usersCache = cloned;
    if (db) db.collection('game').doc('users').set({ data: cloned }).catch(e => console.error('Firestore write:', e.message));
  } else if (name === 'missions') {
    missionsCache = cloned;
    if (db) db.collection('game').doc('missions').set({ data: cloned }).catch(e => console.error('Firestore write:', e.message));
  } else if (name === 'chat') {
    chatCache = cloned;
    if (db) db.collection('game').doc('chat').set({ messages: cloned }).catch(e => console.error('Firestore write:', e.message));
  }
}

module.exports = { init, readJSON, writeJSON };
