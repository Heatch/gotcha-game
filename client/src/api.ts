const BASE = '/api';

export async function login(name: string, password: string) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  return res.json();
}

export async function getMissionPool(name: string) {
  const res = await fetch(`${BASE}/missions/pool?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function selectMission(name: string, missionId: number) {
  const res = await fetch(`${BASE}/missions/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, missionId }),
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

export async function getUsers() {
  const res = await fetch(`${BASE}/users/names`);
  return res.json();
}
