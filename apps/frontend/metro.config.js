const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Default monorepo setup watches the whole repo; Metro then walks `apps/strapi` and
// tries to fs.watch `dist/config` before `strapi develop` has created it → ENOENT.
// Only watch workspace packages + hoisted node_modules (pnpm).
config.watchFolders = [
  path.join(workspaceRoot, 'packages'),
  path.join(workspaceRoot, 'node_modules'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
