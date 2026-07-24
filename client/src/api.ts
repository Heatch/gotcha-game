const BASE = '/api';

export async function login(name: string, password: string) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  return res.json();
}

export async function getMissionPool(name: string, refill = false) {
  const params = new URLSearchParams({ name });
  if (refill) params.set('refill', 'true');
  const res = await fetch(`${BASE}/missions/pool?${params}`);
  return res.json();
}

export async function selectMission(name: string, missionId: number, refill = false) {
  const res = await fetch(`${BASE}/missions/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, missionId, refill }),
  });
  return res.json();
}

export async function updateMissionStatus(
  name: string,
  missionIndex: number,
  status: 'failed' | 'completed',
  gotted?: string,
  comments?: string
) {
  const res = await fetch(`${BASE}/missions/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, missionIndex, status, gotted, comments }),
  });
  return res.json();
}

export async function refreshUser(name: string) {
  const res = await fetch(`${BASE}/user?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function checkRefill(name: string) {
  const res = await fetch(`${BASE}/missions/refill?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${BASE}/users/names`);
  return res.json();
}
