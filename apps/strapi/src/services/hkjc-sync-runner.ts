import {
  runHkjcFixtureJob,
  runHkjcMeetingsJob,
  runHkjcHistoryJob,
} from './hkjc-daily-job';
import type { MeetingsJobOptions } from './hkjc-daily-job';
import {
  runAnalysisForMeeting,
  runAnalysisForUpcomingRaces,
} from './race-analysis-job';

const running = {
  fixture: false,
  meetings: false,
  history: false,
  analysis: false,
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

export async function runHkjcMeetingsJobOnce(
  strapi: any,
  opts?: MeetingsJobOptions
): Promise<{ started: boolean }> {
  if (running.meetings) return { started: false };
  running.meetings = true;
  try {
    await runHkjcMeetingsJob(strapi, opts);
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

export function isAnalysisJobRunning(): boolean {
  return running.analysis;
}

export async function runAnalysisJobOnce(
  strapi: any,
  meetingKey?: string,
): Promise<{ started: boolean }> {
  if (running.analysis) return { started: false };
  running.analysis = true;
  try {
    if (meetingKey) {
      await runAnalysisForMeeting(strapi, meetingKey);
    } else {
      await runAnalysisForUpcomingRaces(strapi);
    }
    return { started: true };
  } finally {
    running.analysis = false;
  }
}
