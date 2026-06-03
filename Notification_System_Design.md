# Notification System Design

**Author:** G Vishwa Sundar  
**Roll No:** 2338666  
**Track:** Frontend  
**Date:** June 2026

---

## 1. Overview

This document describes the architecture and design decisions for the Notification Application built as part of the AffordMed campus placement evaluation.

The application allows college students to:
- View all notifications from an evaluation server
- Filter notifications by type (Event, Result, Placement)
- Navigate through notifications using pagination
- Track which notifications are new vs already viewed
- View a priority inbox of the most important unread notifications

---

## 2. System Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend (Port 3000)     │
│                                             │
│  ┌──────────────┐    ┌───────────────────┐  │
│  │  All Notifs  │    │  Priority Inbox   │  │
│  │     Page     │    │      Page         │  │
│  └──────┬───────┘    └────────┬──────────┘  │
│         │                     │             │
│         └──────────┬──────────┘             │
│                    │                        │
│         ┌──────────▼──────────┐             │
│         │   useNotifications  │             │
│         │   (Custom Hook)     │             │
│         └──────────┬──────────┘             │
│                    │                        │
│         ┌──────────▼──────────┐             │
│         │  notificationService│             │
│         │  (API + Read State) │             │
│         └──────────┬──────────┘             │
│                    │                        │
│         ┌──────────▼──────────┐             │
│         │   priorityEngine    │             │
│         │  (Ranking Algorithm)│             │
│         └──────────┬──────────┘             │
│                    │                        │
│         ┌──────────▼──────────┐             │
│         │  logging_middleware  │             │
│         │  (Log every action) │             │
│         └──────────┬──────────┘             │
└────────────────────┼────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  AffordMed Eval     │
          │  Server             │
          │  4.224.186.213      │
          │                     │
          │  GET /notifications  │
          │  POST /logs          │
          └─────────────────────┘
```

---

## 3. Folder Structure

```
2338666/
├── logging_middleware/
│   ├── logger.js            ← Reusable Log() function
│   ├── test_logger.js       ← Manual test script
│   └── README.md
│
├── notification_app_be/
│   ├── notificationService.js  ← API + read/unread state
│   ├── priorityEngine.js       ← Priority ranking algorithm
│   ├── test_priority.js        ← Manual test script
│   └── README.md
│
├── notification_app_fe/        ← React app (Stage 2)
│   ├── src/
│   │   ├── api/
│   │   │   └── notificationApi.js   ← API calls (adapted for React)
│   │   ├── hooks/
│   │   │   └── useNotifications.js  ← Custom hook
│   │   ├── utils/
│   │   │   ├── priorityEngine.js    ← Same algorithm, ES module version
│   │   │   └── logger.js            ← Logger, ES module version
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationCard.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   └── Pagination.jsx
│   │   ├── pages/
│   │   │   ├── AllNotifications.jsx
│   │   │   └── PriorityInbox.jsx
│   │   └── App.jsx
│   └── package.json
│
├── Notification_System_Design.md   ← This file
└── .gitignore
```

---

## 4. How Notifications Are Fetched

The evaluation server exposes a single GET endpoint:

```
GET http://4.224.186.213/evaluation-service/notifications
```

### Query Parameters

| Parameter           | Type    | Description                                          |
|---------------------|---------|------------------------------------------------------|
| `limit`             | integer | Number of notifications per page (default: 10)       |
| `page`              | integer | Page number, 1-indexed                               |
| `notification_type` | string  | Optional filter: `Event`, `Result`, or `Placement`   |

### Example Requests

```
GET /evaluation-service/notifications?limit=10&page=1
GET /evaluation-service/notifications?limit=10&page=2
GET /evaluation-service/notifications?limit=10&page=1&notification_type=Placement
```

### Authentication

All requests must include the bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Response Shape

```json
{
  "ID": "abc123",
  "Type": "Result",
  "Message": "Mid-sem results published",
  "Timestamp": "2026-04-22 17:51:30"
}
```

The frontend normalises the response so that both array and object formats are handled gracefully.

---

## 5. Priority Algorithm

### Goal

The Priority Inbox should show the most important unread notifications first, so the student sees the things that matter most without scrolling through everything.

### Design Decision

A simple **weighted score** approach was chosen over more complex methods (e.g. ML ranking, decay functions) for two reasons:
1. It is transparent and easy to explain in an interview.
2. It requires no external dependencies or training data.

### Score Formula

```
priority_score = type_weight + recency_score
```

### Type Weights

| Type        | Weight |
|-------------|--------|
| Placement   | 300    |
| Result      | 200    |
| Event       | 100    |

These weights ensure that a Placement notification always outranks a Result, and a Result always outranks an Event — regardless of recency.

### Recency Score

```
recency_score = ((notification_timestamp - oldest_timestamp) /
                 (newest_timestamp - oldest_timestamp)) * 99
```

This scales recency to a 0–99 range across the current set.  
The maximum recency bonus (99) is less than the gap between type weights (100),  
which means **type always wins** over recency.

However, within the same type, the more recent notification wins.

### Example

| ID | Type      | Timestamp           | Type Weight | Recency Score | Total |
|----|-----------|---------------------|-------------|---------------|-------|
| 5  | Placement | 2026-04-22 18:00:00 | 300         | 99            | 399   |
| 3  | Placement | 2026-04-19 14:00:00 | 300         | ~30           | 330   |
| 2  | Result    | 2026-04-21 09:00:00 | 200         | ~75           | 275   |
| 6  | Result    | 2026-04-18 08:00:00 | 200         | 0             | 200   |
| 4  | Event     | 2026-04-22 17:00:00 | 100         | ~96           | 196   |
| 1  | Event     | 2026-04-20 10:00:00 | 100         | ~50           | 150   |

Final ranking: 5 → 3 → 2 → 6 → 4 → 1

---

## 6. Unread / Viewed State

### Problem

The API does not track which notifications a user has seen.  
We need to distinguish "new" notifications from "already viewed" ones  
so the UI can highlight them visually.

### Solution

We maintain a **Set of viewed notification IDs** stored in `localStorage`.

```
key: 'viewed_notification_ids'
value: JSON array of notification ID strings
```

When a notification is rendered on screen, its ID is added to the set.  
On subsequent renders, `isNew = !viewedIds.has(notification.ID)`.

This approach:
- Persists across page refreshes (uses localStorage)
- Requires zero backend changes
- Works offline
- Is fast (Set lookup is O(1))

### Limitation

If the user clears their browser data, the viewed state is reset.  
For a production system, this would be stored server-side per user session.

---

## 7. How the UI Consumes the Data

The React frontend uses a custom hook (`useNotifications`) that:

1. Takes `limit`, `page`, and `type` as parameters
2. Calls `fetchNotifications()` from the notification service
3. Annotates each item with `isNew` (using `annotateWithReadStatus`)
4. Logs the fetch event via the logging middleware
5. Returns `{ notifications, loading, error, total }` to the component

The Priority Inbox page:
1. Fetches a large batch of notifications (no filter)
2. Passes the full list through `rankByPriority(notifications, topN)`
3. Renders only the top-N results

---

## 8. Logging Strategy

Every meaningful user action and system event is logged via the middleware.

| Event                           | Level  | Package     |
|---------------------------------|--------|-------------|
| Page loaded                     | info   | page        |
| API fetch started               | debug  | api         |
| API fetch succeeded             | info   | api         |
| API fetch failed                | error  | api         |
| Filter changed                  | info   | component   |
| Page number changed             | info   | component   |
| Notification marked as viewed   | info   | state       |
| Priority inbox loaded           | info   | page        |
| Token not found                 | warn   | auth        |

---

## 9. Scalability Considerations

### Current Approach
- Client-side pagination (fetch page by page)
- Client-side priority ranking (sort after fetch)
- Client-side read tracking (localStorage)

### Future Improvements (for production scale)

1. **Server-side read tracking**: Move viewed state to a database, associated with user sessions.
2. **WebSocket or SSE**: Push new notifications in real time instead of polling.
3. **Caching**: Cache API responses for a short duration to reduce load on the server.
4. **Virtualised lists**: For very long notification lists, use windowing (e.g., `react-window`) to avoid rendering thousands of DOM nodes.
5. **Server-side priority ranking**: If the notification volume grows, move the priority algorithm to the backend and return pre-ranked results.

---

## 10. Tech Stack Summary

| Layer          | Choice              | Reason                                      |
|----------------|---------------------|---------------------------------------------|
| Frontend       | React               | Component-based, easy to learn and explain  |
| Styling        | Material UI         | Pre-built components, consistent design     |
| State          | React hooks only    | No need for Redux at this scale             |
| Persistence    | localStorage        | Simple, no backend needed for read state    |
| Logging        | Custom middleware   | Meets evaluation server requirements        |
| HTTP client    | Native fetch()      | No extra dependency needed                  |
