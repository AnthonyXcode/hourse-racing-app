const path = require('path');

const strapiDir = path.join(__dirname, 'apps', 'strapi');
const frontendDir = path.join(__dirname, 'apps', 'frontend');

/** Strapi production API port. */
const PROD_STRAPI_PORT = 1337;

/** PM2: Strapi start + static web (`serve dist`). Run `pnpm build:frontend` before first start. */
module.exports = {
  apps: [
    {
      name: 'horse-racing-strapi',
      cwd: strapiDir,
      script: 'pnpm',
      args: 'run start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: path.join(__dirname, 'logs', 'pm2', 'strapi-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2', 'strapi-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: PROD_STRAPI_PORT,
      },
    },
    {
      name: 'horse-racing-frontend',
      cwd: frontendDir,
      script: 'pnpm',
      args: 'run start:web',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: path.join(__dirname, 'logs', 'pm2', 'frontend-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2', 'frontend-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
