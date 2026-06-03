// src/utils/priorityEngine.js
// Priority ranking algorithm — ES module version for React.
// Author: G Vishwa Sundar | Roll No: 2338666

const TYPE_WEIGHTS = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

function parseTimestamp(str) {
  return new Date(str.replace(' ', 'T'));
}

function calculateScore(notification, oldestMs, newestMs) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] ?? 0;
  const notifMs = parseTimestamp(notification.Timestamp).getTime();
  const timeRange = newestMs - oldestMs || 1;
  const recencyScore = Math.round(((notifMs - oldestMs) / timeRange) * 99);
  return typeWeight + recencyScore;
}

/**
 * rankByPriority(notifications, topN)
 * Returns top-N notifications sorted by:
 *   1. Type weight  (Placement > Result > Event)
 *   2. Recency      (newer beats older within same type)
 */
export function rankByPriority(notifications, topN = 10) {
  if (!notifications || notifications.length === 0) return [];

  const timestamps = notifications.map((n) =>
    parseTimestamp(n.Timestamp).getTime()
  );
  const oldestMs = Math.min(...timestamps);
  const newestMs = Math.max(...timestamps);

  return notifications
    .map((n) => ({
      ...n,
      _priorityScore: calculateScore(n, oldestMs, newestMs),
    }))
    .sort((a, b) => b._priorityScore - a._priorityScore)
    .slice(0, topN);
}

export function getPriorityLabel(type) {
  return { Placement: 'High', Result: 'Medium', Event: 'Low' }[type] ?? 'Low';
}

export function getPriorityColor(type) {
  return {
    Placement: 'error',   // red  → urgent
    Result: 'warning',    // amber
    Event: 'info',        // blue
  }[type] ?? 'default';
}

export { TYPE_WEIGHTS };
