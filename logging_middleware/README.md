# Logging Middleware

**Author:** G Vishwa Sundar  
**Roll No:** 2338666

---

## What This Does

This is a shared logging utility for the notification application.  
It sends structured log entries to the AffordMed evaluation server.

Every meaningful action in the frontend (API calls, page loads, errors, etc.)  
should be recorded using this logger so the evaluation platform can track activity.

---

## File Structure

```
logging_middleware/
├── logger.js        ← Main reusable Log() function
├── test_logger.js   ← Quick test script (run manually)
└── README.md        ← This file
```

---

## Function Signature

```js
Log(stack, level, packageName, message, token)
```

| Parameter     | Type   | Description                              |
|---------------|--------|------------------------------------------|
| `stack`       | string | Must be `'frontend'`                     |
| `level`       | string | One of: `debug`, `info`, `warn`, `error`, `fatal` |
| `packageName` | string | See allowed packages below               |
| `message`     | string | Human-readable description of the event  |
| `token`       | string | Bearer token from authentication         |

---

## Allowed Package Names (Frontend)

| Package      | When to use                              |
|--------------|------------------------------------------|
| `api`        | API calls, fetch operations              |
| `component`  | UI component events (render, click, etc.)|
| `hook`       | Custom React hook activity               |
| `page`       | Page load, navigation events             |
| `state`      | State changes, context updates           |
| `style`      | Theme or style-related events            |
| `auth`       | Authentication, token handling           |
| `config`     | App configuration, env variables         |
| `middleware` | Middleware events                        |
| `utils`      | Utility function usage                   |

---

## Usage Examples

### Direct Log call
```js
const { Log } = require('./logging_middleware/logger');

await Log('frontend', 'info', 'page', 'All Notifications page loaded', token);
await Log('frontend', 'error', 'api', 'Failed to fetch notifications', token);
```

### Using the createLogger wrapper (cleaner syntax)
```js
const { createLogger } = require('./logging_middleware/logger');

const logger = createLogger(token); // bind your token once

await logger.info('component', 'Notification card rendered');
await logger.warn('api', 'API response was slow');
await logger.error('hook', 'useNotifications hook failed');
```

---

## How to Test

```bash
cd logging_middleware
node test_logger.js
```

You should see log IDs printed to the console for each successful log.  
Failed validation tests will print the rejection reason (no server hit).

---

## Error Handling

- **Validation errors** are thrown immediately without hitting the server.
- **Network errors** are caught and re-thrown with a clear message.
- **Server errors** (non-2xx) are thrown with the status and server message.
