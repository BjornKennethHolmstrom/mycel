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
        const data: StoredPeer[] = [];
        for (const [, p] of peers) {
            data.push({
                pubkey: p.pubkey,
                name: p.name,
                nip05: p.nip05,
                lastSeen: p.lastSeen,
                presence: p.presence ? {
                    capacity: p.presence.capacity,
                    offers: [...p.presence.offers],
                    needs: [...p.presence.needs],
                    mood: p.presence.mood,
                    locationHash: p.presence.locationHash,
                    expiry: p.presence.expiry,
                    timestamp: p.presence.timestamp
                } : undefined
            });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // storage full, circular ref, or unavailable
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
