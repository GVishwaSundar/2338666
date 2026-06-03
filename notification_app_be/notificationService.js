/**
 * notification_app_be/notificationService.js
 *
 * Handles all communication with the AffordMed evaluation notifications API.
 *
 * Author: G Vishwa Sundar
 * Roll No: 2338666
 *
 * This module is designed to be imported into the React frontend.
 * It is kept as a plain JS module (no React-specific code) so it can
 * also be tested independently from Node.js.
 */

const BASE_URL = 'http://4.224.186.213';
const NOTIFICATIONS_ENDPOINT = `${BASE_URL}/evaluation-service/notifications`;

// ─── Valid filter types ───────────────────────────────────────────────────────

const NOTIFICATION_TYPES = ['Event', 'Result', 'Placement'];

// ─── Fetch notifications from the API ────────────────────────────────────────

/**
 * fetchNotifications(options)
 *
 * Fetches paginated notifications from the evaluation server.
 *
 * @param {object} options
 * @param {string}  options.token           - Bearer access token
 * @param {number}  [options.limit=10]      - Items per page
 * @param {number}  [options.page=1]        - Page number (1-indexed)
 * @param {string}  [options.type]          - Optional filter: 'Event' | 'Result' | 'Placement'
 *
 * @returns {Promise<{ notifications: Array, total: number, page: number, limit: number }>}
 */
async function fetchNotifications({ token, limit = 10, page = 1, type = null }) {
  // Build the query string
  const params = new URLSearchParams();
  params.set('limit', limit);
  params.set('page', page);
  if (type && NOTIFICATION_TYPES.includes(type)) {
    params.set('notification_type', type);
  }

  const url = `${NOTIFICATIONS_ENDPOINT}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch notifications: ${response.status} — ${errorBody}`
    );
  }

  const data = await response.json();

  /*
   * The API may return data in different shapes depending on the server version.
   * We normalise it here so the rest of the app always gets a consistent format.
   *
   * Expected shapes:
   *   { notifications: [...], total: N }
   *   or just an array [...]
   */
  if (Array.isArray(data)) {
    return {
      notifications: data,
      total: data.length,
      page,
      limit,
    };
  }

  return {
    notifications: data.notifications ?? data.data ?? [],
    total: data.total ?? data.count ?? 0,
    page: data.page ?? page,
    limit: data.limit ?? limit,
  };
}

// ─── Read/Unread tracking (localStorage-based) ───────────────────────────────

const VIEWED_KEY = 'viewed_notification_ids';

/**
 * Returns the Set of notification IDs that the user has already viewed.
 * Persists in localStorage so it survives page refreshes.
 *
 * @returns {Set<string>}
 */
function getViewedIds() {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Marks one or more notification IDs as viewed.
 * Appends to the existing set (does not replace it).
 *
 * @param {string | string[]} ids
 */
function markAsViewed(ids) {
  const viewed = getViewedIds();
  const idsArray = Array.isArray(ids) ? ids : [ids];
  idsArray.forEach((id) => viewed.add(id));

  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]));
  } catch {
    // localStorage not available (e.g. SSR or private mode) — silently skip
  }
}

/**
 * Checks if a notification ID has been viewed.
 *
 * @param {string} id
 * @returns {boolean}
 */
function isViewed(id) {
  return getViewedIds().has(id);
}

/**
 * Annotates each notification in an array with an `isNew` field.
 * isNew = true  → user has NOT viewed it yet
 * isNew = false → user HAS viewed it before
 *
 * @param {Array} notifications
 * @returns {Array}  Same array but each item has an added `isNew` boolean
 */
function annotateWithReadStatus(notifications) {
  const viewed = getViewedIds();
  return notifications.map((n) => ({
    ...n,
    isNew: !viewed.has(n.ID),
  }));
}

/**
 * Clears the entire viewed-IDs store.
 * Useful for testing or a "mark all as unread" feature.
 */
function clearViewedIds() {
  try {
    localStorage.removeItem(VIEWED_KEY);
  } catch {
    // ignore
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  fetchNotifications,
  getViewedIds,
  markAsViewed,
  isViewed,
  annotateWithReadStatus,
  clearViewedIds,
  NOTIFICATION_TYPES,
  BASE_URL,
};
