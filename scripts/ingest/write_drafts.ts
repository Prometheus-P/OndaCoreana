import fs from 'node:fs';
import path from 'node:path';
import { DraftItem } from './normalize';

const BASE_PATH = path.join(process.cwd(), 'data', 'drafts');

function formatDateFolder(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readDraftFile(filePath: string): DraftItem | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as DraftItem;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️  Could not read ${filePath}: ${message}`);
    return null;
  }
}

export function loadRecentDrafts(lookbackDays = 7): DraftItem[] {
  if (!fs.existsSync(BASE_PATH)) {
    return [];
  }

  const entries = fs.readdirSync(BASE_PATH, { withFileTypes: true });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const drafts: DraftItem[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderDate = new Date(entry.name);
    if (Number.isNaN(folderDate.getTime()) || folderDate < cutoff) continue;

    const folderPath = path.join(BASE_PATH, entry.name);
    const files = fs.readdirSync(folderPath).filter((file) => file.endsWith('.json'));

    for (const file of files) {
      const draft = readDraftFile(path.join(folderPath, file));
      if (draft) {
        drafts.push(draft);
      }
    }
  }

  return drafts;
}

export function writeDrafts(drafts: DraftItem[], date = new Date()): string[] {
  if (!drafts.length) {
    console.log('No new drafts to write.');
    return [];
  }

  const folderName = formatDateFolder(date);
  const targetDir = path.join(BASE_PATH, folderName);
  fs.mkdirSync(targetDir, { recursive: true });

  const writtenPaths: string[] = [];

  for (const draft of drafts) {
    const filePath = path.join(targetDir, `${draft.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(draft, null, 2), 'utf-8');
    writtenPaths.push(filePath);
  }

  console.log(`Saved ${writtenPaths.length} drafts to ${targetDir}`);
  return writtenPaths;
}
