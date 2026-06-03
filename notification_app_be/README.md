# Notification App — Backend Logic

**Author:** G Vishwa Sundar  
**Roll No:** 2338666

---

## What's In This Folder

```
notification_app_be/
├── notificationService.js   ← Fetches notifications, manages read/unread state
├── priorityEngine.js        ← Priority ranking algorithm
├── test_priority.js         ← Manual test for the priority algorithm
└── README.md                ← This file
```

---

## notificationService.js

Handles all API communication with the evaluation server.

```js
const { fetchNotifications, annotateWithReadStatus, markAsViewed } =
  require('./notificationService');

// Fetch page 1, 10 items, only Placement type
const result = await fetchNotifications({
  token: ACCESS_TOKEN,
  limit: 10,
  page: 1,
  type: 'Placement',
});

// Annotate with isNew field
const annotated = annotateWithReadStatus(result.notifications);

// Mark some as viewed
markAsViewed(['id-1', 'id-2']);
```

---

## priorityEngine.js

Ranks notifications by importance.

```js
const { rankByPriority, getPriorityLabel } = require('./priorityEngine');

// Sort and return top 10
const topNotifications = rankByPriority(allNotifications, 10);

// Get label for a type
getPriorityLabel('Placement'); // → 'High'
getPriorityLabel('Result');    // → 'Medium'
getPriorityLabel('Event');     // → 'Low'
```

Priority weights:
- Placement → 300
- Result    → 200
- Event     → 100

Within the same type, newer notifications rank higher.

---

## Test the priority engine

```bash
cd notification_app_be
node test_priority.js
```

---

## Full architecture

See [`../Notification_System_Design.md`](../Notification_System_Design.md)
