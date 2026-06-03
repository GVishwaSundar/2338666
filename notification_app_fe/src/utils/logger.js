// src/utils/logger.js
// ES Module version of the logging middleware for use inside the React app.
// Author: G Vishwa Sundar | Roll No: 2338666

// Use relative path — CRA proxy forwards to http://4.224.186.213
const LOGS_ENDPOINT = '/evaluation-service/logs';

const ALLOWED_STACKS = ['frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = [
  'api', 'component', 'hook', 'page', 'state',
  'style', 'auth', 'config', 'middleware', 'utils',
];

function validateParams(stack, level, packageName, message) {
  if (!ALLOWED_STACKS.includes(stack))
    throw new Error(`Invalid stack: "${stack}"`);
  if (!ALLOWED_LEVELS.includes(level))
    throw new Error(`Invalid level: "${level}"`);
  if (!ALLOWED_PACKAGES.includes(packageName))
    throw new Error(`Invalid package: "${packageName}"`);
  if (!message || message.trim() === '')
    throw new Error('Log message must be a non-empty string.');
}

/**
 * Log(stack, level, packageName, message, token)
 * Sends a structured log entry to the AffordMed evaluation server.
 */
export async function Log(stack, level, packageName, message, token) {
  try {
    validateParams(stack, level, packageName, message);
  } catch (e) {
    console.warn('[Logger] Validation failed:', e.message);
    return null;
  }

  try {
    const response = await fetch(LOGS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: packageName, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Logger] Server rejected log:', response.status, data);
      return null;
    }

    const logId = data.logId || data.id || data.log_id || 'ok';
    console.log(`[Logger] ✅ ${level.toUpperCase()} | ${packageName} | ${message} | ID: ${logId}`);
    return logId;
  } catch (err) {
    // Never crash the app because logging failed
    console.warn('[Logger] Network error:', err.message);
    return null;
  }
}

/**
 * createLogger(token) — convenience wrapper
 * Usage: const logger = createLogger(token);
 *        await logger.info('page', 'App loaded');
 */
export function createLogger(token) {
  return {
    debug: (pkg, msg) => Log('frontend', 'debug', pkg, msg, token),
    info:  (pkg, msg) => Log('frontend', 'info',  pkg, msg, token),
    warn:  (pkg, msg) => Log('frontend', 'warn',  pkg, msg, token),
    error: (pkg, msg) => Log('frontend', 'error', pkg, msg, token),
    fatal: (pkg, msg) => Log('frontend', 'fatal', pkg, msg, token),
  };
}
