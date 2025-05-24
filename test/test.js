const { retryAsync } = require('../src');

async function unstableTask() {
  if (Math.random() < 0.7) throw new Error('Random failure');
  return 'Success!';
}

(async () => {
  try {
    const result = await retryAsync(unstableTask, {
      retries: 5,
      initialDelay: 500,
      maxDelay: 3000,
      jitter: true,
      timeoutPerAttempt: 1500,
      retryIf: (err) => err.message.includes('Random'),
      onRetry: (attempt, err) => console.log(`🔁 Attempt ${attempt} failed: ${err.message}`),
      onSuccess: (attempts) => console.log(`✅ Success after ${attempts} tries`),
      onFailure: (err) => console.log(`❌ All retries failed: ${err.message}`)
    });

    console.log('🎉 Final result:', result);
  } catch (err) {
    console.error('❗ Retry process failed:', err.message);
  }
})();
