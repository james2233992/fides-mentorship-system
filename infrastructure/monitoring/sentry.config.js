// Sentry configuration for production monitoring

// Frontend Sentry Configuration (Next.js)
export const sentryFrontendConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    // Performance monitoring
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
    // Session replay
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Performance Monitoring
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/fides-api\.railway\.app\/api/,
  ],
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // User context
  beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException;
      // Filter out network errors in development
      if (error?.message?.includes('NetworkError')) {
        return null;
      }
    }
    return event;
  },
};

// Backend Sentry Configuration (NestJS)
export const sentryBackendConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  
  integrations: [
    // Database query tracking
    new Sentry.Integrations.Prisma({ client: prisma }),
    // HTTP request tracking
    new Sentry.Integrations.Http({ tracing: true }),
    // Express middleware tracking
    new Sentry.Integrations.Express({
      app,
      transaction: 'methodPath',
    }),
  ],
  
  // Performance Monitoring
  profilesSampleRate: 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,
  
  // Server name
  serverName: 'fides-api',
  
  // Filtering
  ignoreErrors: [
    // Ignore specific error types
    'ValidationError',
    'UnauthorizedException',
  ],
  
  beforeSend(event, hint) {
    // Add additional context
    if (event.exception) {
      const error = hint.originalException;
      
      // Add user context if available
      if (event.request?.user) {
        event.user = {
          id: event.request.user.id,
          email: event.request.user.email,
          username: event.request.user.email,
        };
      }
      
      // Filter out specific errors
      if (error?.status === 404) {
        return null;
      }
    }
    
    return event;
  },
};

// Alert Rules Configuration
export const sentryAlertRules = {
  // Error rate alerts
  errorRateAlert: {
    name: 'High Error Rate',
    conditions: [
      {
        id: 'sentry.rules.conditions.event_frequency.EventFrequencyCondition',
        value: 10,
        interval: '1m',
      },
    ],
    actions: [
      {
        id: 'sentry.integrations.slack.notify_action.SlackNotifyServiceAction',
        channel: '#alerts',
      },
    ],
  },
  
  // Performance alerts
  performanceAlert: {
    name: 'Slow Transaction',
    dataset: 'transactions',
    query: 'transaction.duration:>3000',
    thresholdType: 'above',
    resolveThreshold: 3000,
    triggers: [
      {
        label: 'critical',
        alertThreshold: 5000,
        actions: [
          {
            type: 'slack',
            targetIdentifier: '#critical-alerts',
          },
        ],
      },
    ],
  },
  
  // User impact alerts
  userImpactAlert: {
    name: 'High User Impact',
    conditions: [
      {
        id: 'sentry.rules.conditions.event_frequency.EventUniqueUserFrequencyCondition',
        value: 50,
        interval: '1h',
      },
    ],
    actions: [
      {
        id: 'sentry.integrations.slack.notify_action.SlackNotifyServiceAction',
        channel: '#alerts',
      },
      {
        id: 'sentry.mail.actions.NotifyEmailAction',
        targetType: 'Team',
        targetIdentifier: 'engineering',
      },
    ],
  },
};