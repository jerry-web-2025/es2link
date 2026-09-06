import * as Sentry from '@sentry/react';

const SENTRY_DSN = 'https://de11e3590935759c54bca099fb4c1de0@o4512036348297216.ingest.de.sentry.io/4512036952080464';

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrions: [],
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request?.data) {
        delete event.request.data;
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter((crumb) => {
          if (crumb.category === 'fetch' || crumb.category === 'xhr') {
            return false;
          }
          return true;
        });
      }
      return event;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, string>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export { Sentry };
