/**
 * notification_app_be/test_priority.js
 *
 * Quick test to verify the priority engine works correctly.
 * Run with: node test_priority.js
 *
 * Uses mock notification data so you don't need to call the API.
 */

const { rankByPriority, getPriorityLabel } = require('./priorityEngine');

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockNotifications = [
  { ID: '1', Type: 'Event',     Message: 'Tech Fest Registration',   Timestamp: '2026-04-20 10:00:00' },
  { ID: '2', Type: 'Result',    Message: 'Mid-sem Results Published', Timestamp: '2026-04-21 09:00:00' },
  { ID: '3', Type: 'Placement', Message: 'Google Drive On Campus',    Timestamp: '2026-04-19 14:00:00' },
  { ID: '4', Type: 'Event',     Message: 'Hackathon 2026',            Timestamp: '2026-04-22 17:00:00' },
  { ID: '5', Type: 'Placement', Message: 'Microsoft PPT Tomorrow',    Timestamp: '2026-04-22 18:00:00' },
  { ID: '6', Type: 'Result',    Message: 'Lab Exam Results',          Timestamp: '2026-04-18 08:00:00' },
];

// ─── Run the ranking ──────────────────────────────────────────────────────────

console.log('=== Priority Engine Test ===\n');
console.log('Input (6 notifications, mixed types and dates)\n');

const ranked = rankByPriority(mockNotifications, 10);

console.log('Ranked output (highest priority first):\n');
ranked.forEach((n, index) => {
  const label = getPriorityLabel(n.Type);
  console.log(
    `  ${index + 1}. [${n.Type.padEnd(10)}] [${label.padEnd(6)}] Score: ${n._priorityScore} | ${n.Message} | ${n.Timestamp}`
  );
});

console.log('\nExpected order:');
console.log('  Placements first (highest type weight + recency)');
console.log('  Results next');
console.log('  Events last');
console.log('\n=== Test complete ===');
