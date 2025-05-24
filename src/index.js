function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryAsync(fn, options = {}) {
  const {
    retries = 3,
    initialDelay = 500,
    maxDelay = 5000,
    jitter = false,
    timeoutPerAttempt = 0,
    retryIf = () => true,
    onRetry = () => {},
    onSuccess = () => {},
    onFailure = () => {},
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await (timeoutPerAttempt
        ? Promise.race([
            fn(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeoutPerAttempt)
            ),
          ])
        : fn());

      onSuccess(attempt);
      return result;

    } catch (err) {
      if (attempt < retries && retryIf(err)) {
        onRetry(attempt, err);

        let delay = initialDelay * Math.pow(2, attempt - 1);
        if (jitter) {
          const jitterValue = Math.floor(Math.random() * delay * 0.3);
          delay += (Math.random() > 0.5 ? 1 : -1) * jitterValue;
        }
        delay = Math.min(delay, maxDelay);
        await wait(delay);
      } else {
        onFailure(err);
        throw err;
      }
    }
  }
}

module.exports = { retryAsync };
