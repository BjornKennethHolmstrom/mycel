/**
 * Mycel peer persistence — load only.
 * Saving is handled by persistPeers() in app.ts.
 */

import type { Peer } from '$lib/types';

export interface StoredPeer {
	pubkey: string;
	name?: string;
	nip05?: string;
	lastSeen: number;
	presence?: Peer['presence'];
}

export function loadPeers(): StoredPeer[] {
	try {
		const raw = localStorage.getItem('mycel_peers');
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export function clearPeers() {
	localStorage.removeItem('mycel_peers');
}
