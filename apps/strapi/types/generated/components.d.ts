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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'fixture.meeting-slot': FixtureMeetingSlot;
    }
  }
}
