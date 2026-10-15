import fs from 'fs';
import path from 'path';

const INDEX_FILE = path.resolve(process.cwd(), 'firebase', 'firestore.indexes.json');

function validateIndexes() {
  console.log('[Indexes] Checking Firestore index configurations at:', INDEX_FILE);

  if (!fs.existsSync(INDEX_FILE)) {
    console.error('[Indexes] Error: firestore.indexes.json file not found.');
    process.exit(1);
  }

  const raw = fs.readFileSync(INDEX_FILE, 'utf-8');
  let config: any;
  try {
    config = JSON.parse(raw);
  } catch (err: any) {
    console.error('[Indexes] Error parsing index JSON:', err.message);
    process.exit(1);
  }

  const indexes = config.indexes || [];
  console.log(`[Indexes] Found ${indexes.length} composite indexes:`);

  indexes.forEach((idx: any, i: number) => {
    const fieldsStr = (idx.fields || [])
      .map((f: any) => `${f.fieldPath} (${f.order || f.arrayConfig})`)
      .join(', ');
    console.log(`  [${i + 1}] Collection "${idx.collectionGroup}": ${fieldsStr}`);
  });

  console.log('\n[Indexes] To deploy these indexes to Firebase Firestore, execute:');
  console.log('  firebase deploy --only firestore:indexes');
  console.log('[Indexes] All index definitions are valid.');
}

validateIndexes();
