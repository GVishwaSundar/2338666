/**
 * logging_middleware/logger.js
 *
 * Reusable logging utility for AffordMed Evaluation Project.
 * Author: G Vishwa Sundar
 * Roll No: 2338666
 *
 * Usage:
 *   const { Log } = require('./logger');
 *   await Log('frontend', 'info', 'component', 'Notification list rendered');
 */

const BASE_URL = 'http://4.224.186.213';
const LOGS_ENDPOINT = `${BASE_URL}/evaluation-service/logs`;

// ─── Allowed values ───────────────────────────────────────────────────────────

const ALLOWED_STACKS = ['frontend'];

const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

// These are the only package names allowed for the frontend stack
const ALLOWED_PACKAGES_FRONTEND = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
];

// ─── Validation helper ────────────────────────────────────────────────────────

/**
 * Validates all parameters before sending to the log server.
 * Throws a descriptive error if anything is wrong.
 */
function validateParams(stack, level, packageName, message) {
  if (!ALLOWED_STACKS.includes(stack)) {
    throw new Error(
      `Invalid stack: "${stack}". Allowed values: ${ALLOWED_STACKS.join(', ')}`
    );
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    throw new Error(
      `Invalid level: "${level}". Allowed values: ${ALLOWED_LEVELS.join(', ')}`
    );
  }

  if (!ALLOWED_PACKAGES_FRONTEND.includes(packageName)) {
    throw new Error(
      `Invalid package: "${packageName}". Allowed frontend packages: ${ALLOWED_PACKAGES_FRONTEND.join(', ')}`
    );
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Log message must be a non-empty string.');
  }
}

// ─── Main Log function ────────────────────────────────────────────────────────

/**
 * Log(stack, level, packageName, message)
 *
 * Sends a structured log entry to the AffordMed evaluation log server.
 *
 * @param {string} stack       - Must be 'frontend'
 * @param {string} level       - One of: debug, info, warn, error, fatal
 * @param {string} packageName - One of the allowed frontend package names
 * @param {string} message     - Human-readable description of the event
 * @param {string} token       - Bearer token (access_token from auth)
 * @returns {Promise<string>}  - The log ID returned by the server
 */
async function Log(stack, level, packageName, message, token) {
  // Step 1: Validate all inputs before doing anything
  try {
    validateParams(stack, level, packageName, message);
  } catch (validationError) {
    console.error('[Logger] Validation failed:', validationError.message);
    throw validationError;
  }

  // Step 2: Build the request payload
  const payload = {
    stack,
    level,
    package: packageName,
    message,
  };

  // Step 3: Send to the evaluation server
  try {
    const response = await fetch(LOGS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // Step 4: Parse the response
    const data = await response.json();

    if (!response.ok) {
      console.error(
        `[Logger] Server returned ${response.status}:`,
        JSON.stringify(data)
      );
      throw new Error(
        `Log server error: ${response.status} — ${JSON.stringify(data)}`
      );
    }

    // Step 5: Display and return the log ID
    const logId = data.logId || data.id || data.log_id || JSON.stringify(data);
    console.log(`[Logger] ✅ Log sent successfully | ID: ${logId}`);
    return logId;
  } catch (networkError) {
    // Catch fetch/network failures separately so we don't lose the error message
    if (networkError.message.startsWith('Log server error:')) {
      throw networkError;
    }
    console.error('[Logger] Network error while sending log:', networkError.message);
    throw new Error(`Network error: ${networkError.message}`);
  }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
// These make calling code cleaner — just pass the message and token.

const createLogger = (token) => ({
  debug: (pkg, msg) => Log('frontend', 'debug', pkg, msg, token),
  info:  (pkg, msg) => Log('frontend', 'info',  pkg, msg, token),
  warn:  (pkg, msg) => Log('frontend', 'warn',  pkg, msg, token),
  error: (pkg, msg) => Log('frontend', 'error', pkg, msg, token),
  fatal: (pkg, msg) => Log('frontend', 'fatal', pkg, msg, token),
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  Log,
  createLogger,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  ALLOWED_PACKAGES_FRONTEND,
};
