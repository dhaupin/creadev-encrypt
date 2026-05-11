# @creadev.org/encrypt

> Encrypt - crypto utilities

[![npm](https://img.shields.io/npm/v/@creadev.org/encrypt)](https://www.npmjs.com/package/@creadev.org/encrypt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install @creadev.org/encrypt
```

## Usage

```typescript
import { generateId, generateToken, hash, encrypt, decrypt } from '@creadev.org/encrypt';

const id = generateId();
const token = generateToken();
const hashed = await hash('password');
const encrypted = await encrypt(data, key);
const decrypted = await decrypt(encrypted, key);
```

## API

| Function | Description |
|----------|-------------|
| `generateId()` | Generate unique ID |
| `generateToken()` | Generate secure token |
| `hash(data)` | Hash data |
| `encrypt(data, key)` | Encrypt data |
| `decrypt(data, key)` | Decrypt data |

## License

MIT
trigger
