import {
  clearPostLoginRedirect,
  consumePostLoginRedirect,
  peekPostLoginRedirect,
  setPostLoginRedirect,
} from '../postLoginRedirect';

describe('postLoginRedirect', () => {
  beforeEach(() => {
    clearPostLoginRedirect();
  });

  test('stores and consumes allowed route once', () => {
    setPostLoginRedirect('/dashboard/quick-log');

    expect(peekPostLoginRedirect()).toBe('/dashboard/quick-log');
    expect(consumePostLoginRedirect()).toBe('/dashboard/quick-log');
    expect(consumePostLoginRedirect()).toBeNull();
  });

  test('normalizes unknown route to dashboard', () => {
    setPostLoginRedirect('/unknown-route');

    expect(consumePostLoginRedirect()).toBe('/dashboard');
  });
});
