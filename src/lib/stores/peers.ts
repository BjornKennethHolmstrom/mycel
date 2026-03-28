/**
 * Mycel peer persistence
 * Saves known peers (names, last presence) to localStorage.
 * Trust scores are recomputed from the trust store on load, not saved here.
 */

import type { Peer } from '$lib/types';

const STORAGE_KEY = 'mycel_peers';

interface StoredPeer {
	pubkey: string;
	name?: string;
	nip05?: string;
	lastSeen: number;
	presence?: Peer['presence'];
}

export function savePeers(peers: Map<string, Peer>) {
	try {
		const data: StoredPeer[] = Array.from(peers.values()).map((p) => ({
			pubkey: p.pubkey,
			name: p.name,
			nip05: p.nip05,
			lastSeen: p.lastSeen,
			presence: p.presence
		}));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// storage full or unavailable
	}
}

export function loadPeers(): StoredPeer[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export function clearPeers() {
	localStorage.removeItem(STORAGE_KEY);
}
