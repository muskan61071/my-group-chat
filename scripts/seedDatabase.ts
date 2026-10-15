import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const sampleGroups = {
  grp_frontend_guild: {
    id: 'grp_frontend_guild',
    name: '💻 Frontend & UI Guild',
    description: 'Frontend architectural discussions, React component design, and CSS animations.',
    imageURL: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    visibility: 'public',
    ownerId: 'usr_admin',
    memberIds: ['usr_admin', 'usr_maya'],
    memberCount: 2,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now(),
    lastMessageAt: Date.now(),
    lastMessagePreview: 'All components styled with warm brown tokens!',
    activeInviteCode: 'REACT2026',
    settings: {
      membersCanPost: true,
      membersCanInvite: true,
      disappearingDuration: 0,
      allowVoiceNotes: true,
      allowMediaSharing: true,
    },
  },
};

const sampleMembers = {
  grp_frontend_guild: {
    usr_admin: {
      userId: 'usr_admin',
      displayName: 'Alex Admin',
      role: 'admin',
      joinedAt: Date.now() - 43200000,
    },
    usr_maya: {
      userId: 'usr_maya',
      displayName: 'Maya Moderator',
      role: 'moderator',
      joinedAt: Date.now() - 40000000,
    },
  },
};

const sampleInvites = {
  REACT2026: {
    code: 'REACT2026',
    groupId: 'grp_frontend_guild',
    createdBy: 'usr_admin',
    createdAt: Date.now() - 43200000,
    expiresAt: Date.now() + 86400000 * 30,
    maxUses: 500,
    usesCount: 2,
  },
};

const sampleMessages = {
  grp_frontend_guild: [
    {
      id: 'msg_fe_1',
      groupId: 'grp_frontend_guild',
      senderId: 'usr_admin',
      senderName: 'Alex Admin',
      kind: 'text',
      text: 'All components styled with warm tokens!',
      reactions: { '🔥': ['usr_maya'] },
      createdAt: Date.now() - 1200000,
    },
  ],
};

function seed() {
  console.log('[Seed] Seeding local store at:', DATA_FILE);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let existing = { groups: {}, members: {}, invites: {}, messages: {} };
  if (fs.existsSync(DATA_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
      console.warn('[Seed] Existing store was invalid JSON; overwriting.');
    }
  }

  const merged = {
    groups: { ...sampleGroups, ...(existing.groups || {}) },
    members: { ...sampleMembers, ...(existing.members || {}) },
    invites: { ...sampleInvites, ...(existing.invites || {}) },
    messages: { ...sampleMessages, ...(existing.messages || {}) },
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log('[Seed] Database successfully seeded with demo groups, members, and messages!');
}

seed();
