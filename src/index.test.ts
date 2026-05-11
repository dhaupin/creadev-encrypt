import { describe, it, expect } from 'vitest';
import { generateId, hash } from '../src/index';

describe('generateId', () => {
  it('generates id', () => {
    const id = generateId();
    expect(id).toBeTruthy();
  });
});

describe('hash', () => {
  it('hashes string', async () => {
    const h = await hash('test');
    expect(h).toBeTruthy();
  });
});
