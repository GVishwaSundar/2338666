/**
 * notification_app_be/priorityEngine.js
 *
 * Priority algorithm for ranking notifications in the Priority Inbox.
 *
 * Author: G Vishwa Sundar
 * Roll No: 2338666
 *
 * ─── Algorithm Explanation ────────────────────────────────────────────────────
 *
 * Each notification gets a numeric "priority score" calculated as:
 *
 *   score = typeWeight + recencyScore
 *
 * typeWeight:
 *   Placement → 300
 *   Result    → 200
 *   Event     → 100
 *
 * recencyScore:
 *   Derived from the notification's timestamp.
 *   More recent notifications get a higher recencyScore.
 *   This is a value between 0 and 99 based on how recent the item is
 *   within the set being ranked.
 *
 * Final sort: descending score (highest priority at the top).
 *
 * This approach is simple, understandable, and interview-friendly.
 */

// ─── Type weights ─────────────────────────────────────────────────────────────

const TYPE_WEIGHTS = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

/**
 * Parses the notification timestamp string into a Date object.
 * Expected format: "YYYY-MM-DD HH:MM:SS"
 *
 * @param {string} timestampStr
 * @returns {Date}
 */
function parseTimestamp(timestampStr) {
  // Replace the space separator with 'T' so the Date constructor handles it
  // consistently across browsers and Node.js environments.
  return new Date(timestampStr.replace(' ', 'T'));
}

/**
 * Calculates a priority score for a single notification.
 *
 * The score is composed of:
 *   - A type weight (Placement > Result > Event)
 *   - A recency bonus (0–99) relative to the oldest and newest items in the list
 *
 * Doing the recency relative to the full list means items are compared
 * fairly regardless of absolute dates.
 *
 * @param {object} notification   - A single notification object from the API
 * @param {number} oldestMs       - Unix ms of the oldest item in the full list
 * @param {number} newestMs       - Unix ms of the newest item in the full list
 * @returns {number}              - The final priority score
 */
function calculateScore(notification, oldestMs, newestMs) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] ?? 0;

  const notifMs = parseTimestamp(notification.Timestamp).getTime();

  // Avoid divide-by-zero when all timestamps are identical
  const timeRange = newestMs - oldestMs || 1;

  // Scale recency to a 0–99 range
  const recencyScore = Math.round(((notifMs - oldestMs) / timeRange) * 99);

  return typeWeight + recencyScore;
}

/**
 * Ranks notifications by priority.
 *
 * Steps:
 *   1. Find the oldest and newest timestamps in the list (for recency scaling).
 *   2. Compute a score for each notification.
 *   3. Sort descending by score.
 *   4. Return the top N results.
 *
 * @param {Array}  notifications  - Array of notification objects from the API
 * @param {number} topN           - How many to return (10, 15, or 20)
 * @returns {Array}               - Sorted, trimmed array of notifications
 */
function rankByPriority(notifications, topN = 10) {
  if (!notifications || notifications.length === 0) return [];

  // Step 1: Find the time range across the entire list
  const timestamps = notifications.map((n) =>
    parseTimestamp(n.Timestamp).getTime()
  );
  const oldestMs = Math.min(...timestamps);
  const newestMs = Math.max(...timestamps);

  // Step 2 & 3: Score and sort
  const scored = notifications
    .map((notification) => ({
      ...notification,
      _priorityScore: calculateScore(notification, oldestMs, newestMs),
    }))
    .sort((a, b) => b._priorityScore - a._priorityScore);

  // Step 4: Return top N
  return scored.slice(0, topN);
}

/**
 * Returns the human-readable label for a notification's type weight.
 * Useful for displaying priority badges in the UI.
 *
 * @param {string} type  - 'Placement' | 'Result' | 'Event'
 * @returns {string}     - 'High' | 'Medium' | 'Low'
 */
function getPriorityLabel(type) {
  const labels = {
    Placement: 'High',
    Result: 'Medium',
    Event: 'Low',
  };
  return labels[type] ?? 'Unknown';
}

module.exports = {
  rankByPriority,
  calculateScore,
  getPriorityLabel,
  TYPE_WEIGHTS,
};
