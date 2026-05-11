import { describe, it, expect } from 'vitest';
import { generateId, hash, encrypt, decrypt } from '../src/index';

describe('generateId', () => {
  it('generates unique id', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});

describe('hash', () => {
  it('creates hash', async () => {
    const h = await hash('test');
    expect(h).toBeTruthy();
    expect(typeof h).toBe('string');
  });
});
