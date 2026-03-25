import type { Core } from '@strapi/strapi';

const config = (_params: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  documentation: {
    enabled: true,
  },
});

export default config;
