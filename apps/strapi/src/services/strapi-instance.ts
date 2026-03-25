let appStrapi: unknown;

export function setAppStrapi(strapi: unknown): void {
  appStrapi = strapi;
}

export function getAppStrapi(): unknown {
  return appStrapi;
}
