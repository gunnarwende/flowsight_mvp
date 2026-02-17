// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  environment: process.env.SENTRY_ENVIRONMENT,
dsn: "https://e86f9aaf5d34929e8b0a8279fdc5bc7d@o4510902144401408.ingest.de.sentry.io/4510902158950480",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.05,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});


