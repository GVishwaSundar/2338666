// src/api/notificationApi.js
// All API calls to the AffordMed evaluation server.
// Author: G Vishwa Sundar | Roll No: 2338666

// Use relative path — CRA proxy forwards to http://4.224.186.213
const NOTIFICATIONS_ENDPOINT = '/evaluation-service/notifications';

export const NOTIFICATION_TYPES = ['Event', 'Result', 'Placement'];

/**
 * fetchNotifications({ token, limit, page, type })
 * Fetches paginated notifications from the evaluation server.
 *
 * @returns {{ notifications: Array, total: number, page: number, limit: number }}
 */
export async function fetchNotifications({ token, limit = 10, page = 1, type = null }) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(page));
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
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Normalise different response shapes the server might return
  if (Array.isArray(data)) {
    return { notifications: data, total: data.length, page, limit };
  }

  return {
    notifications: data.notifications ?? data.data ?? [],
    total: data.total ?? data.count ?? 0,
    page: data.page ?? page,
    limit: data.limit ?? limit,
  };
}
