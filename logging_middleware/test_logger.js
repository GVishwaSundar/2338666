/**
 * logging_middleware/test_logger.js
 *
 * Quick manual test for the logging middleware.
 * Run with: node test_logger.js
 *
 * This sends a real log entry to the evaluation server.
 * Check the console for the returned log ID.
 */

const { Log, createLogger } = require('./logger');

// Paste your access_token here for testing
const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhYmNkZ3ZzQGdtYWlsLmNvbSIsImV4cCI6MTc4MDQ4MzgyNSwiaWF0IjoxNzgwNDgyOTI1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMzZkMWRlNjgtNDViMS00NjY5LWE0YjktNjUzZjFlODBlMGVjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZyB2aXNod2Egc3VuZGFyIiwic3ViIjoiNTY2M2JjYjUtMTc2ZC00ZGY3LTk3MjgtZDI3MzE5YmEyMGZkIn0sImVtYWlsIjoiYWJjZGd2c0BnbWFpbC5jb20iLCJuYW1lIjoiZyB2aXNod2Egc3VuZGFyIiwicm9sbE5vIjoiMjMzODY2NiIsImFjY2Vzc0NvZGUiOiJud3dzS3giLCJjbGllbnRJRCI6IjU2NjNiY2I1LTE3NmQtNGRmNy05NzI4LWQyNzMxOWJhMjBmZCIsImNsaWVudFNlY3JldCI6ImtuaGpQclRHelNxWmNkdWoifQ.av0aiGYyscipZ7tvSnBrnO50LYYSWTXo2JL24BLeiUQ';

async function runTests() {
  console.log('=== Logging Middleware Test ===\n');

  // Test 1: Basic Log call
  console.log('Test 1: Sending an info log from the "component" package...');
  try {
    const logId = await Log(
      'frontend',
      'info',
      'component',
      'Logging middleware test — notification list rendered',
      ACCESS_TOKEN
    );
    console.log(`  → Log ID received: ${logId}\n`);
  } catch (err) {
    console.error('  → Test 1 FAILED:', err.message, '\n');
  }

  // Test 2: Using the convenience wrapper (createLogger)
  console.log('Test 2: Using createLogger convenience wrapper...');
  try {
    const logger = createLogger(ACCESS_TOKEN);
    await logger.info('page', 'All Notifications page loaded');
    await logger.warn('api', 'API response took longer than expected');
    console.log('  → Both logs sent successfully\n');
  } catch (err) {
    console.error('  → Test 2 FAILED:', err.message, '\n');
  }

  // Test 3: Validation — bad level should throw without hitting server
  console.log('Test 3: Validation check — using an invalid level...');
  try {
    await Log('frontend', 'critical', 'component', 'This should fail', ACCESS_TOKEN);
    console.error('  → Test 3 FAILED: Should have thrown an error\n');
  } catch (err) {
    console.log(`  → Correctly rejected: ${err.message}\n`);
  }

  // Test 4: Validation — bad package name
  console.log('Test 4: Validation check — using a backend-only package name...');
  try {
    await Log('frontend', 'info', 'cache', 'This should also fail', ACCESS_TOKEN);
    console.error('  → Test 4 FAILED: Should have thrown an error\n');
  } catch (err) {
    console.log(`  → Correctly rejected: ${err.message}\n`);
  }

  console.log('=== All tests complete ===');
}

runTests();
