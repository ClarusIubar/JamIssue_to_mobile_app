import { collectEvents } from './daejeon-event-sync/fetch';
import { logCollectedEvents, logUploadResult } from './daejeon-event-sync/report';
import type { EventSyncRange } from './daejeon-event-sync/types';
import { uploadEvents } from './daejeon-event-sync/upload';

function parseArgs(argv: string[]) {
  const options = {
    dryRun: false,
    from: null as string | null,
    to: null as string | null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--from') {
      options.from = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (arg === '--to') {
      options.to = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function getSeoulDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function formatUtcDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultRange(): EventSyncRange {
  const todayParts = getSeoulDateParts();
  const start = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + Number(process.env.FESTIVAL_SYNC_RANGE_DAYS || 90));
  return {
    from: formatUtcDateKey(start),
    to: formatUtcDateKey(end),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const defaultRange = getDefaultRange();
  const range: EventSyncRange = {
    from: options.from || defaultRange.from,
    to: options.to || defaultRange.to,
  };

  const result = await collectEvents(range);
  logCollectedEvents(result, range);

  if (options.dryRun) {
    return;
  }

  const uploadResult = await uploadEvents(result.items, range);
  logUploadResult(uploadResult.importedEvents ?? result.items.length, process.env.PUBLIC_EVENT_IMPORT_URL);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
