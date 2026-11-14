/// <reference types="astro/client" />

interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (distinctId: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
    captureException: (error: unknown) => void;
    [key: string]: unknown;
  };
  __posthog_initialized?: boolean;
  flock?: {
    track: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
    identify: (id: string) => void;
  };
  /** Events waiting for flock.js to load (components/flock.astro). */
  flockQueue?: [string, Record<string, string | number | boolean | null>][];
  /** Sends one analytics event to PostHog and Flock (components/track.astro). */
  track: (event: string, properties?: Record<string, unknown>) => void;
}
