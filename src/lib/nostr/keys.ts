/**
 * Mycel key management
 * Simple key storage using localStorage for Phase 0.
 * Phase 1+ should use secure enclave / encrypted storage.
 */

import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';

/** Convert bytes to hex string */
function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Convert hex string to bytes */
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

const STORAGE_KEY = 'mycel_sk';

/** Generate a new keypair and store it */
export function createIdentity(): { sk: Uint8Array; pk: string } {
	const sk = generateSecretKey();
	const pk = getPublicKey(sk);
	localStorage.setItem(STORAGE_KEY, bytesToHex(sk));
	return { sk, pk };
}

/** Load existing key from storage */
export function loadIdentity(): { sk: Uint8Array; pk: string } | null {
	const hex = localStorage.getItem(STORAGE_KEY);
	if (!hex) return null;

	try {
		const sk = hexToBytes(hex);
		const pk = getPublicKey(sk);
		return { sk, pk };
	} catch {
		return null;
	}
}

/** Check if an identity exists */
export function hasIdentity(): boolean {
	return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Delete stored identity */
export function clearIdentity() {
	localStorage.removeItem(STORAGE_KEY);
}

/** Get the hex-encoded secret key (for backup display) */
export function exportSecretKeyHex(): string | null {
	return localStorage.getItem(STORAGE_KEY);
}

/** Import a hex-encoded secret key */
export function importSecretKeyHex(hex: string): { sk: Uint8Array; pk: string } {
	const sk = hexToBytes(hex);
	const pk = getPublicKey(sk);
	localStorage.setItem(STORAGE_KEY, hex);
	return { sk, pk };
}
