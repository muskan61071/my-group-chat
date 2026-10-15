import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function cleanup() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('[Cleanup] No data/store.json file found.');
    return;
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const store = JSON.parse(raw);
  const now = Date.now();
  let expiredCount = 0;

  if (store.messages) {
    for (const groupId of Object.keys(store.messages)) {
      const msgs = store.messages[groupId] || [];
      const valid = msgs.filter((m: any) => {
        if (m.expiresAt && m.expiresAt <= now) {
          expiredCount++;
          return false;
        }
        return true;
      });
      store.messages[groupId] = valid;
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  console.log(`[Cleanup] Successfully removed ${expiredCount} expired messages from local store.`);
}

cleanup();
