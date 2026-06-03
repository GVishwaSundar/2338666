// src/hooks/useNotifications.js
// Custom React hook that fetches + annotates notifications.
// Author: G Vishwa Sundar | Roll No: 2338666

import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications } from '../api/notificationApi';
import { createLogger } from '../utils/logger';
import { ACCESS_TOKEN } from '../config/auth';

const VIEWED_KEY = 'viewed_notification_ids';

// ── Read / Unread helpers (localStorage) ──────────────────────────────────────

function getViewedIds() {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveViewedIds(set) {
  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify([...set]));
  } catch { /* private mode – ignore */ }
}

export function markAsViewed(ids) {
  const viewed = getViewedIds();
  (Array.isArray(ids) ? ids : [ids]).forEach((id) => viewed.add(id));
  saveViewedIds(viewed);
}

function annotate(notifications) {
  const viewed = getViewedIds();
  return notifications.map((n) => ({ ...n, isNew: !viewed.has(n.ID) }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useNotifications({ limit, page, type })
 *
 * @returns {{ notifications, total, loading, error, refetch }}
 */
export function useNotifications({ limit = 10, page = 1, type = null } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const logger = createLogger(ACCESS_TOKEN);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    await logger.debug('hook', `Fetching notifications — page:${page} limit:${limit} type:${type ?? 'all'}`);

    try {
      const result = await fetchNotifications({
        token: ACCESS_TOKEN,
        limit,
        page,
        type,
      });

      const annotated = annotate(result.notifications);
      setNotifications(annotated);
      setTotal(result.total);

      await logger.info('api', `Fetched ${result.notifications.length} notifications (page ${page})`);
    } catch (err) {
      setError(err.message);
      await logger.error('api', `Failed to fetch notifications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, page, type]);

  useEffect(() => {
    load();
  }, [load]);

  return { notifications, total, loading, error, refetch: load };
}
