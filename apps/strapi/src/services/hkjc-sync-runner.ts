import {
  runHkjcFixtureJob,
  runHkjcMeetingsJob,
  runHkjcHistoryJob,
} from './hkjc-daily-job';

const running = {
  fixture: false,
  meetings: false,
  history: false,
};

export function isHkjcFixtureJobRunning(): boolean {
  return running.fixture;
}

export function isHkjcMeetingsJobRunning(): boolean {
  return running.meetings;
}

export function isHkjcHistoryJobRunning(): boolean {
  return running.history;
}

export async function runHkjcFixtureJobOnce(strapi: any): Promise<{ started: boolean }> {
  if (running.fixture) return { started: false };
  running.fixture = true;
  try {
    await runHkjcFixtureJob(strapi);
    return { started: true };
  } finally {
    running.fixture = false;
  }
}

export async function runHkjcMeetingsJobOnce(strapi: any): Promise<{ started: boolean }> {
  if (running.meetings) return { started: false };
  running.meetings = true;
  try {
    await runHkjcMeetingsJob(strapi);
    return { started: true };
  } finally {
    running.meetings = false;
  }
}

export async function runHkjcHistoryJobOnce(strapi: any): Promise<{ started: boolean }> {
  if (running.history) return { started: false };
  running.history = true;
  try {
    await runHkjcHistoryJob(strapi);
    return { started: true };
  } finally {
    running.history = false;
  }
}
