import test from 'node:test'
import assert from 'node:assert/strict'
import { pbkdf2Sync } from 'node:crypto'
import { passwordHash } from '../src/fundStore.js'
test('browser password derivation matches the initialization format',async()=>{const password='test-only-password',salt='0123456789abcdef';assert.equal(await passwordHash(password,salt,1000),pbkdf2Sync(password,salt,1000,32,'sha256').toString('hex'));assert.notEqual(await passwordHash('wrong',salt,1000),await passwordHash(password,salt,1000))})
