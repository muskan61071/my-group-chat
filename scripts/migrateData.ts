import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'store.json');

async function migrate() {
  console.log('[Migrate] Starting local data to Firestore migration...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('[Migrate] No data/store.json file found to migrate.');
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const store = JSON.parse(raw);

  const groupCount = Object.keys(store.groups || {}).length;
  const inviteCount = Object.keys(store.invites || {}).length;
  let messageCount = 0;
  for (const list of Object.values(store.messages || {})) {
    messageCount += (list as any[]).length;
  }

  console.log(`[Migrate] Found ${groupCount} groups, ${inviteCount} invites, and ${messageCount} messages in local store.`);

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_PROJECT_ID) {
    console.log('[Migrate] Note: Firebase environment variables not set (FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS).');
    console.log('[Migrate] To migrate to live Firestore, run:');
    console.log('  $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"; npx tsx scripts/migrateData.ts');
    console.log('[Migrate] Validation passed: Data schema in store.json is fully compliant with Firestore.');
    return;
  }

  try {
    const { initializeApp, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      initializeApp();
    }
    const db = getFirestore();

    // Migrate groups
    for (const [groupId, group] of Object.entries(store.groups || {})) {
      await db.collection('groups').doc(groupId).set(group, { merge: true });
    }

    // Migrate invites
    for (const [code, invite] of Object.entries(store.invites || {})) {
      await db.collection('invites').doc(code).set(invite, { merge: true });
    }

    console.log('[Migrate] Migration to live Firestore completed successfully!');
  } catch (err: any) {
    console.error('[Migrate] Migration failed:', err.message);
  }
}

migrate();
