import { SEARCH_URL, SOURCE_NAME } from './constants';
import type { EventSyncRange, ImportedEvent } from './types';

type UploadResult = {
  importedEvents?: number;
};

function buildImportPayload(items: ImportedEvent[], range: EventSyncRange) {
  return {
    sourceName: SOURCE_NAME,
    sourceUrl: `${SEARCH_URL}&beginDt=${range.from}&endDt=${range.to}`,
    importedAt: new Date().toISOString(),
    items,
  };
}

export async function uploadEvents(items: ImportedEvent[], range: EventSyncRange): Promise<UploadResult> {
  const importUrl = String(process.env.PUBLIC_EVENT_IMPORT_URL || '').trim();
  const token = String(process.env.EVENT_IMPORT_TOKEN || '').trim();

  if (!importUrl) {
    throw new Error('PUBLIC_EVENT_IMPORT_URL is required.');
  }
  if (!token) {
    throw new Error('EVENT_IMPORT_TOKEN is required.');
  }

  const response = await fetch(importUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(buildImportPayload(items, range)),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload imported events (${response.status}): ${await response.text()}`);
  }

  return response.json();
}
