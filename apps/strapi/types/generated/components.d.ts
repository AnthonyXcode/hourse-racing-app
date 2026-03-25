import type { Schema, Struct } from '@strapi/strapi';

export interface FixtureMeetingSlot extends Struct.ComponentSchema {
  collectionName: 'components_fixture_meeting_slots';
  info: {
    description: 'Scheduled race meeting date and venue';
    displayName: 'Meeting slot';
  };
  attributes: {
    raceDate: Schema.Attribute.Date & Schema.Attribute.Required;
    venue: Schema.Attribute.Enumeration<['ST', 'HV']> &
      Schema.Attribute.Required;
  };
}

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
    phases: Schema.Attribute.Component<'healthcheck.job-phase', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'fixture.meeting-slot': FixtureMeetingSlot;
      'healthcheck.job-phase': HealthcheckJobPhase;
      'healthcheck.sync-metrics': HealthcheckSyncMetrics;
    }
  }
}
