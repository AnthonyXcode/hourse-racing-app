import { format } from 'date-fns';
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
  all: false,
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

/**
 * Cron wrapper: runs analysis only when today is a racing day
 * (i.e. a Fixture exists whose raceDate matches today).
 */
export async function runAnalysisCronJobOnce(strapi: any): Promise<{ started: boolean }> {
  const documents = strapi.documents;
  if (!documents) return { started: false };

  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const fixture = await documents('api::fixture.fixture').findFirst({
    filters: { raceDate: { $eq: todayIso } },
  });

  if (!fixture) {
    strapi.log.info(`hkjc-cron: analysis skipped — ${todayIso} is not a racing day`);
    return { started: true };
  }

  return runAnalysisJobOnce(strapi);
}

export function isAllJobsRunning(): boolean {
  return running.all;
}

/**
 * Trigger all four sync jobs sequentially:
 * fixture → meetings → history → analysis.
 */
export async function runAllJobsOnce(strapi: any): Promise<{ started: boolean }> {
  if (running.all) return { started: false };
  running.all = true;
  try {
    await runHkjcFixtureJobOnce(strapi);
    await runHkjcMeetingsJobOnce(strapi);
    await runHkjcHistoryJobOnce(strapi);
    await runAnalysisJobOnce(strapi);
    return { started: true };
  } finally {
    running.all = false;
  }
}
