import type { CollectedEvents } from './types';

export function logCollectedEvents(result: CollectedEvents, range: { from: string; to: string }) {
  console.log(`Collected ${result.items.length} unique events across ${result.pageCount} pages for ${range.from}..${range.to}.`);

  if (result.items[0]) {
    console.log(`First event: ${result.items[0].startsAt.slice(0, 10)} ${result.items[0].title}`);
  }
}

export function logUploadResult(importedEvents: number, importUrl: string | undefined) {
  console.log(`Uploaded ${importedEvents} events to ${importUrl}.`);
}
