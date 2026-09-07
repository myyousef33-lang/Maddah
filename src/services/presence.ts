import { StorageService } from './storage';
import { db, doc, getDoc, setDoc } from './firebase';

const PRESENCE_STORAGE_KEY = 'maddah_math_db_presence_v1';
const HEARTBEAT_INTERVAL_MS = 30000;
const ACTIVE_THRESHOLD_MS = 120000;
const CLEANUP_THRESHOLD_MS = 300000;

interface SessionEntry { lastSeen: number; studentId?: string; studentName?: string; }
interface PresenceData { sessions: Record<string, SessionEntry>; }

const getSessionId = (): string => {
  let id = sessionStorage.getItem('maddah_math_session_id');
  if (!id) { id = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(); sessionStorage.setItem('maddah_math_session_id', id); }
  return id;
};

const getLocalPresence = (): PresenceData => {
  try { const parsed = JSON.parse(localStorage.getItem(PRESENCE_STORAGE_KEY) || 'null'); if (parsed?.sessions) return parsed; } catch (_) {}
  return { sessions: {} };
};
const saveLocalPresence = (data: PresenceData) => localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(data));
let activeCountListeners: ((count: number) => void)[] = [];
let currentActiveCount = 0;
let heartbeatTimer: any = null;
let syncCheckTimer: any = null;

const calculateActiveCount = (data: PresenceData) => Object.values(data.sessions || {}).filter(s => s && typeof s.lastSeen === 'number' && Date.now() - s.lastSeen <= ACTIVE_THRESHOLD_MS).length;
const notifyCountListeners = (count: number) => { currentActiveCount = count; activeCountListeners.forEach(cb => { try { cb(count); } catch (_) {} }); };

const writePresence = async (data: PresenceData) => {
  try {
    const docRef = doc(db, 'app_data', PRESENCE_STORAGE_KEY);
    await setDoc(docRef, { data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[Firebase Presence] Write error:', err);
  }
};

const readPresence = async (): Promise<PresenceData | null> => {
  try {
    const docRef = doc(db, 'app_data', PRESENCE_STORAGE_KEY);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.data || null;
    }
  } catch (err) {
    console.warn('[Firebase Presence] Read error:', err);
  }
  return null;
};

export const PresenceService = {
  async sendHeartbeat(): Promise<void> {
    const sessionId = getSessionId(); const currentStudent = StorageService.getCurrentStudent(); const now = Date.now();
    const local = getLocalPresence(); const updatedSessions: Record<string, SessionEntry> = {};
    Object.entries(local.sessions || {}).forEach(([id, sess]) => { if (sess && now - sess.lastSeen < CLEANUP_THRESHOLD_MS) updatedSessions[id] = sess; });
    updatedSessions[sessionId] = { lastSeen: now, studentId: currentStudent?.id, studentName: currentStudent?.name };
    const newData = { sessions: updatedSessions }; saveLocalPresence(newData);
    try { await writePresence(newData); } catch (_) {}
    notifyCountListeners(calculateActiveCount(newData));
  },
  getActiveCount(): number { return calculateActiveCount(getLocalPresence()); },
  subscribeActiveCount(callback: (count: number) => void): () => void { activeCountListeners.push(callback); callback(this.getActiveCount()); return () => { const i = activeCountListeners.indexOf(callback); if (i !== -1) activeCountListeners.splice(i, 1); }; },
  initPresence(): void {
    if (heartbeatTimer) return;
    setTimeout(() => { void this.sendHeartbeat(); }, 2500);
    heartbeatTimer = setInterval(() => { if (document.visibilityState === 'visible') void this.sendHeartbeat(); }, HEARTBEAT_INTERVAL_MS);
    syncCheckTimer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try { const remote = await readPresence(); if (remote?.sessions) { const merged = { sessions: { ...remote.sessions, ...getLocalPresence().sessions } }; saveLocalPresence(merged); notifyCountListeners(calculateActiveCount(merged)); } } catch (_) { notifyCountListeners(calculateActiveCount(getLocalPresence())); }
    }, 20000);
    window.addEventListener('focus', () => { void this.sendHeartbeat(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void this.sendHeartbeat(); });
  }
};

