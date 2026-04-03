import type { Schema, Struct } from '@strapi/strapi';

export interface HealthcheckJobPhase extends Struct.ComponentSchema {
  collectionName: 'components_healthcheck_job_phases';
  info: {
    description: 'One step of a healthcheck job run';
    displayName: 'Job phase';
  };
  attributes: {
    detail: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    status: Schema.Attribute.Enumeration<
      ['success', 'failure', 'partial', 'skipped']
    > &
      Schema.Attribute.Required;
  };
}

export interface HealthcheckSyncMetrics extends Struct.ComponentSchema {
  collectionName: 'components_healthcheck_sync_metrics';
  info: {
    description: 'Structured metrics for HKJC daily sync healthchecks';
    displayName: 'Sync metrics';
  };
  attributes: {
    hkjcMeetingsFetched: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    meetingsCreated: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    meetingsExisting: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    meetingsRaceDetailsFailed: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    meetingsRaceDetailsUpdated: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    phases: Schema.Attribute.Component<'healthcheck.job-phase', true>;
  };
}

export interface HistoryDividendAmount extends Struct.ComponentSchema {
  collectionName: 'components_history_dividend_amounts';
  info: {
    description: 'Single dividend payout (e.g. one place or QPL slot)';
    displayName: 'Dividend amount';
  };
  attributes: {
    amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface HistoryFinishPlacing extends Struct.ComponentSchema {
  collectionName: 'components_history_finish_placings';
  info: {
    description: 'One horse line in official race results';
    displayName: 'Finish placing';
  };
  attributes: {
    actualWeight: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 140;
          min: 100;
        },
        number
      >;
    draw: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 1;
        },
        number
      >;
    finishPosition: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    finishTime: Schema.Attribute.Decimal;
    horseCode: Schema.Attribute.String;
    horseName: Schema.Attribute.String;
    horseNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    horseWeight: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 2000;
          min: 700;
        },
        number
      >;
    jockeyId: Schema.Attribute.String;
    jockeyName: Schema.Attribute.String;
    margin: Schema.Attribute.Decimal;
    trainerId: Schema.Attribute.String;
    trainerName: Schema.Attribute.String;
    winOdds: Schema.Attribute.Decimal;
  };
}

export interface HistoryRaceResult extends Struct.ComponentSchema {
  collectionName: 'components_history_race_results';
  info: {
    description: 'Full result for one race at a meeting';
    displayName: 'Race result';
  };
  attributes: {
    distance: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    finishOrder: Schema.Attribute.Component<'history.finish-placing', true>;
    going: Schema.Attribute.Enumeration<
      [
        'Firm',
        'Good to Firm',
        'Good',
        'Good to Yielding',
        'Yielding',
        'Soft',
        'Heavy',
        'Wet Fast',
        'Wet Slow',
      ]
    >;
    placeDividends: Schema.Attribute.Component<'history.dividend-amount', true>;
    prizeMoney: Schema.Attribute.BigInteger;
    quinellaDividend: Schema.Attribute.Decimal;
    quinellaPlaceDividends: Schema.Attribute.Component<
      'history.dividend-amount',
      true
    >;
    raceClass: Schema.Attribute.String;
    raceDate: Schema.Attribute.Date & Schema.Attribute.Required;
    raceId: Schema.Attribute.String & Schema.Attribute.Required;
    raceName: Schema.Attribute.String;
    raceNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    surface: Schema.Attribute.Enumeration<['Turf', 'AWT']>;
    tierceDividend: Schema.Attribute.Decimal;
    trioDividend: Schema.Attribute.Decimal;
    venue: Schema.Attribute.Enumeration<['ST', 'HV']> &
      Schema.Attribute.Required;
    winDividend: Schema.Attribute.Decimal;
  };
}

export interface MeetingRaceMetadata extends Struct.ComponentSchema {
  collectionName: 'components_meeting_race_metadatas';
  info: {
    description: 'Non-result race fields (same as History race-result minus dividends and finish order)';
    displayName: 'Race metadata';
  };
  attributes: {
    distance: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    going: Schema.Attribute.Enumeration<
      [
        'Firm',
        'Good to Firm',
        'Good',
        'Good to Yielding',
        'Yielding',
        'Soft',
        'Heavy',
        'Wet Fast',
        'Wet Slow',
      ]
    >;
    prizeMoney: Schema.Attribute.BigInteger;
    raceClass: Schema.Attribute.String;
    raceDate: Schema.Attribute.Date & Schema.Attribute.Required;
    raceId: Schema.Attribute.String & Schema.Attribute.Required;
    raceName: Schema.Attribute.String;
    raceNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    runners: Schema.Attribute.Component<'meeting.race-runner', true>;
    surface: Schema.Attribute.Enumeration<['Turf', 'AWT']>;
    venue: Schema.Attribute.Enumeration<['ST', 'HV']> &
      Schema.Attribute.Required;
  };
}

export interface MeetingRaceRunner extends Struct.ComponentSchema {
  collectionName: 'components_meeting_race_runners';
  info: {
    description: 'Horse line-up fields aligned with history.finish-placing, excluding result-only fields (position, time, margin). Win odds: local results page (past); bet.hkjc WP when only racecard is available.';
    displayName: 'Race runner';
  };
  attributes: {
    horseCode: Schema.Attribute.String;
    horseName: Schema.Attribute.String;
    horseNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    jockey: Schema.Attribute.Relation<'manyToOne', 'api::jockey.jockey'>;
    jockeyId: Schema.Attribute.String;
    jockeyName: Schema.Attribute.String;
    trainer: Schema.Attribute.Relation<'manyToOne', 'api::trainer.trainer'>;
    trainerId: Schema.Attribute.String;
    trainerName: Schema.Attribute.String;
    winOdds: Schema.Attribute.Decimal;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'healthcheck.job-phase': HealthcheckJobPhase;
      'healthcheck.sync-metrics': HealthcheckSyncMetrics;
      'history.dividend-amount': HistoryDividendAmount;
      'history.finish-placing': HistoryFinishPlacing;
      'history.race-result': HistoryRaceResult;
      'meeting.race-metadata': MeetingRaceMetadata;
      'meeting.race-runner': MeetingRaceRunner;
    }
  }
}
