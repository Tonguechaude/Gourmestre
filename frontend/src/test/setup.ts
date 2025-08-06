import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Nettoie après chaque test
afterEach(() => {
  cleanup();
});

// Extension de expect avec jest-dom
expect.extend({});