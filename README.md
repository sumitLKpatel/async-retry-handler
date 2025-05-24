# 🔁 async-retry-pro

A powerful utility for retrying async functions with support for exponential backoff, jitter, per-attempt timeouts, and custom retry logic.

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/Version-1.0.1-blue.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)]()

---

## 📦 Installation

```bash
npm install async-retry-pro
```

## ✨ Features 
- **Exponential Backoff**: Automatically increases delay between retries
- **Jitter Support**: Randomizes delays to prevent thundering herd problems
- **Conditional Retries**: Custom logic to determine which errors should trigger retries
- **Attempt Timeouts**: Set timeouts for individual attempts
- **Lifecycle Hooks**: Callbacks for retry, success, and failure events
- **Fully Typed**: Includes TypeScript definitions

## 🚀 Usage

```javascript
const { retryAsync } = require('async-retry-pro');

async function fetchData() {
  // Your unreliable async operation
}

// Simple usage
const result = await retryAsync(fetchData, {
  retries: 3,
  initialDelay: 1000
});

// Advanced usage with all options
const result = await retryAsync(fetchData, {
  retries: 5,
  initialDelay: 200,
  maxDelay: 5000,
  jitter: true,
  timeoutPerAttempt: 3000,
  retryIf: (err) => err.isRetryable,
  onRetry: (attempt, error, delay) => {
    console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
  },
  onSuccess: (attempts) => {
    console.log(`Succeeded after ${attempts} attempts`);
  },
  onFailure: (error) => {
    console.error('All attempts failed:', error);
  }
});
```
## 🌐 HTTP Request Example

Retry failed HTTP requests with status-based retry logic

```javascript
const axios = require('axios');
const { retryAsync } = require('async-retry-pro');

/**
 * Fetches user data with automatic retry on server errors
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<Object>} User data
 */
async function fetchUserWithRetry(userId) {
  return retryAsync(
    async () => {
      const response = await axios.get(`https://api.service.com/users/${userId}`);
      if (response.status === 404) {
        throw new Error('User not found'); // Non-retryable error
      }
      return response.data;
    },
    {
      retries: 4,
      initialDelay: 1000,
      maxDelay: 8000,
      jitter: true,
      timeoutPerAttempt: 5000,
      retryIf: (error) => {
        // Retry on network errors or 5xx status codes
        return !error.response || error.response.status >= 500;
      },
      onRetry: (attempt, error) => {
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
      }
    }
  );
}

// Usage
fetchUserWithRetry('123')
  .then(user => console.log('User data:', user))
  .catch(error => console.error('Failed after retries:', error.message));

```

## 💾 Database Example

```javascript
const { retryAsync } = require('async-retry-pro');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.DB_URI);

/**
 * Retries database queries with connection resilience
 * @param {string} query - The database query to execute
 * @returns {Promise<Array>} Query results
 */
async function resilientQuery(query) {
  return retryAsync(
    async () => {
      await client.connect();
      const db = client.db('mydb');
      const results = await db.collection('data').find(query).toArray();
      return results;
    },
    {
      retries: 3,
      initialDelay: 500,
      maxDelay: 3000,
      retryIf: (error) => {
        // Retry on connection issues or timeout errors
        return [
          'ECONNRESET',
          'ETIMEDOUT',
          'ESOCKETTIMEDOUT'
        ].includes(error.code);
      },
      onFailure: (error) => {
        console.error('Database operation failed after retries:', error);
        client.close(); // Clean up connection on final failure
      }
    }
  );
}

// Usage
resilientQuery({ status: 'active' })
  .then(results => console.log(`${results.length} records found`))
  .catch(() => console.error('Unable to complete database operation'));
```
## ⚙️ Options

| Option              | Type       | Default      | Description                                                        |
| ------------------- | ---------- | ------------ | ------------------------------------------------------------------ |
| `retries`           | `number`   | `3`          | Maximum number of attempts                                         |
| `initialDelay`      | `number`   | `500`        | Initial delay in ms between retries                                |
| `maxDelay`          | `number`   | `5000`       | Maximum delay between retries                                      |
| `jitter`            | `boolean`  | `false`      | Adds randomness to delay                                           |
| `timeoutPerAttempt` | `number`   | `0`          | Timeout in ms for each attempt (0 means no timeout)                |
| `retryIf`           | `Function` | `() => true` | A function to determine if a retry should occur based on the error |
| `onRetry`           | `Function` | `() => {}`   | Callback triggered on each retry attempt                           |
| `onSuccess`         | `Function` | `() => {}`   | Callback triggered on success (receives number of attempts)        |
| `onFailure`         | `Function` | `() => {}`   | Callback triggered after final failure                             |

---

## ✅ Conclusion

`async-retry-pro` simplifies the complexity of handling unreliable async operations. Whether you're dealing with flaky HTTP APIs, intermittent database connections, or unstable external services, this utility gives you full control with smart retry logic.

Its pluggable hooks, exponential backoff, jitter, and error-aware retry logic make it a powerful yet lightweight tool for production-ready apps.

---

## 📄 License

`async-retry-pro` is released under the [MIT License](http://opensource.org/licenses/MIT).
Copyright (c) 2025 [@sumitLKpatel](https://github.com/sumitLKpatel)