const path = require('path');

const strapiDir = path.join(__dirname, 'apps', 'strapi');
const frontendDir = path.join(__dirname, 'apps', 'frontend');

/** Strapi dev/staging port when prod runs on the same machine (prod API uses 1337). */
const DEV_STRAPI_PORT = 1338;

/** PM2: Strapi develop + Expo web dev server. Web port is set in `apps/frontend` `dev:web` script. */
module.exports = {
  apps: [
    {
      name: 'horse-racing-strapi-dev',
      cwd: strapiDir,
      script: 'pnpm',
      args: 'run develop',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: path.join(__dirname, 'logs', 'pm2', 'strapi-dev-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2', 'strapi-dev-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: DEV_STRAPI_PORT,
      },
    },
    {
      name: 'horse-racing-frontend-dev',
      cwd: frontendDir,
      script: 'pnpm',
      args: 'run dev:web',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: path.join(__dirname, 'logs', 'pm2', 'frontend-dev-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2', 'frontend-dev-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
