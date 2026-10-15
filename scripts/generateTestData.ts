import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'store.json');

function generateTestData(userCount = 10, messagesPerGroup = 25) {
  console.log(`[TestData] Generating test dataset: ${userCount} users, ${messagesPerGroup} messages per group...`);

  const mockUsers = Array.from({ length: userCount }, (_, i) => ({
    userId: `test_user_${i + 1}`,
    displayName: `Test User ${i + 1}`,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${i + 1}`,
  }));

  const testGroupId = 'grp_benchmark_test';
  const testGroup = {
    id: testGroupId,
    name: '⚡ Benchmark & Stress Test Room',
    description: 'Automated test suite room for load testing real-time socket events.',
    visibility: 'public',
    ownerId: mockUsers[0].userId,
    memberIds: mockUsers.map((u) => u.userId),
    memberCount: mockUsers.length,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastMessageAt: Date.now(),
    lastMessagePreview: 'Benchmark test completed.',
    activeInviteCode: 'BENCHMARK',
    settings: {
      membersCanPost: true,
      membersCanInvite: true,
      disappearingDuration: 0,
      allowVoiceNotes: true,
      allowMediaSharing: true,
    },
  };

  const members: Record<string, any> = {};
  mockUsers.forEach((u, i) => {
    members[u.userId] = {
      userId: u.userId,
      displayName: u.displayName,
      role: i === 0 ? 'admin' : i < 3 ? 'moderator' : 'member',
      joinedAt: Date.now() - (userCount - i) * 60000,
    };
  });

  const messages = Array.from({ length: messagesPerGroup }, (_, i) => {
    const sender = mockUsers[i % mockUsers.length];
    return {
      id: `msg_test_${i + 1}`,
      groupId: testGroupId,
      senderId: sender.userId,
      senderName: sender.displayName,
      kind: 'text',
      text: `Automated test message #${i + 1} with timestamp ${new Date().toISOString()}`,
      reactions: i % 3 === 0 ? { '👍': [mockUsers[0].userId] } : {},
      createdAt: Date.now() - (messagesPerGroup - i) * 5000,
    };
  });

  let store = { groups: {}, members: {}, invites: {}, messages: {} } as any;
  if (fs.existsSync(DATA_FILE)) {
    try {
      store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {}
  }

  store.groups = store.groups || {};
  store.members = store.members || {};
  store.invites = store.invites || {};
  store.messages = store.messages || {};

  store.groups[testGroupId] = testGroup;
  store.members[testGroupId] = members;
  store.messages[testGroupId] = messages;
  store.invites['BENCHMARK'] = {
    code: 'BENCHMARK',
    groupId: testGroupId,
    createdBy: mockUsers[0].userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 7,
    maxUses: 1000,
    usesCount: mockUsers.length,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  console.log(`[TestData] Successfully generated test group ${testGroupId} with ${mockUsers.length} members and ${messages.length} messages.`);
}

generateTestData();
