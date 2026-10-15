import fs from 'fs';
import path from 'path';

interface StoreSchema {
  groups: Record<string, any>;
  members: Record<string, Record<string, any>>;
  invites: Record<string, any>;
  messages: Record<string, any[]>;
  systemBranding?: any;
}

const candidateDirs = [
  path.resolve(process.cwd(), 'data'),
  path.resolve(process.cwd(), '../data'),
  path.resolve(process.cwd(), 'server/data'),
];
const DATA_DIR = candidateDirs.find((dir) => fs.existsSync(dir)) || path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

let storeCache: StoreSchema = {
  groups: {},
  members: {},
  invites: {},
  messages: {},
};

// Load store on startup
function loadStore(): StoreSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        groups: parsed.groups || {},
        members: parsed.members || {},
        invites: parsed.invites || {},
        messages: parsed.messages || {},
        systemBranding: parsed.systemBranding,
      };
    }
  } catch (err) {
    console.warn('[LocalStore] Error reading store.json, using fresh cache:', err);
  }
  return { groups: {}, members: {}, invites: {}, messages: {} };
}

storeCache = loadStore();

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(storeCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LocalStore] Failed to write store.json:', err);
  }
}

export const localStore = {
  getGroups(): Record<string, any> {
    return storeCache.groups;
  },
  getGroup(id: string): any | undefined {
    return storeCache.groups[id];
  },
  saveGroup(group: any) {
    storeCache.groups[group.id] = group;
    persistStore();
  },
  deleteGroup(groupId: string) {
    delete storeCache.groups[groupId];
    delete storeCache.members[groupId];
    delete storeCache.messages[groupId];
    persistStore();
  },

  getMembers(groupId: string): Record<string, any> {
    return storeCache.members[groupId] || {};
  },
  getMember(groupId: string, userId: string): any | undefined {
    return storeCache.members[groupId]?.[userId];
  },
  saveMember(groupId: string, member: any) {
    if (!storeCache.members[groupId]) {
      storeCache.members[groupId] = {};
    }
    storeCache.members[groupId][member.userId] = member;
    persistStore();
  },
  removeMember(groupId: string, userId: string) {
    if (storeCache.members[groupId]) {
      delete storeCache.members[groupId][userId];
      persistStore();
    }
  },

  getInvite(code: string): any | undefined {
    return storeCache.invites[code.toUpperCase()];
  },
  saveInvite(code: string, invite: any) {
    storeCache.invites[code.toUpperCase()] = invite;
    persistStore();
  },

  getMessages(groupId: string): any[] {
    return storeCache.messages[groupId] || [];
  },
  saveMessage(groupId: string, message: any) {
    if (!storeCache.messages[groupId]) {
      storeCache.messages[groupId] = [];
    }
    storeCache.messages[groupId].push(message);
    persistStore();
  },
  updateMessage(groupId: string, messageId: string, updates: Partial<any>) {
    const list = storeCache.messages[groupId];
    if (list) {
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        persistStore();
      }
    }
  },
  getSystemBranding(): any | undefined {
    return storeCache.systemBranding;
  },
  saveSystemBranding(branding: any) {
    storeCache.systemBranding = branding;
    persistStore();
  },
};
