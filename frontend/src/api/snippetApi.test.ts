import { expect, test } from 'vitest';
import { checkHealth } from './snippetApi';

test('checkHealth returns OK from backend', async () => {
  const result = await checkHealth();
  expect(result.status).toBe('ok');
});
