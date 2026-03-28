/**
 * Mycel reactive stores
 * No auto-save — persistence is called explicitly from page components
 * to avoid Svelte 5 proxy/reactivity loops.
 */

import { writable, derived } from 'svelte/store';
import type { Peer, PresenceData } from '$lib/types';

/** Current user's public key */
export const currentPubkey = writable<string>('');

/** Whether the user has loaded/generated keys */
export const isAuthenticated = derived(currentPubkey, ($pk) => $pk.length > 0);

/** All known peers, keyed by pubkey */
export const peers = writable<Map<string, Peer>>(new Map());

/** Update or add a peer */
export function updatePeer(pubkey: string, data: Partial<Peer>) {
	peers.update((map) => {
		const existing = map.get(pubkey) || {
			pubkey,
			trustScore: 0,
			lastSeen: Date.now()
		};
		map.set(pubkey, { ...existing, ...data });
		return new Map(map);
	});
}

/** Update a peer's presence */
export function updatePresence(pubkey: string, presence: PresenceData) {
	peers.update((map) => {
		const existing = map.get(pubkey);
		if (existing) {
			existing.presence = presence;
			existing.lastSeen = presence.timestamp * 1000;
			map.set(pubkey, { ...existing });
		} else {
			map.set(pubkey, {
				pubkey,
				trustScore: 0,
				lastSeen: presence.timestamp * 1000,
				presence
			});
		}
		return new Map(map);
	});
}

/** Peers as a sorted array (by trust score, descending) */
export const peerList = derived(peers, ($peers) => {
	return Array.from($peers.values()).sort((a, b) => b.trustScore - a.trustScore);
});

/** Connection status */
export const connectionStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected');

/**
 * Save peers to localStorage.
 * Call this explicitly after updates, not reactively.
 * Manually extracts plain data to avoid Svelte proxy issues.
 */
export function persistPeers() {
	try {
		const data: Array<{
			pubkey: string;
			name?: string;
			nip05?: string;
			lastSeen: number;
			presence?: PresenceData;
		}> = [];

		let currentMap = new Map<string, Peer>();
		const unsub = peers.subscribe(($p) => { currentMap = $p; });
		unsub();

		for (const p of currentMap.values()) {
			data.push({
				pubkey: p.pubkey,
				name: p.name,
				nip05: p.nip05,
				lastSeen: p.lastSeen,
				presence: p.presence ? {
					capacity: p.presence.capacity,
					offers: Array.from(p.presence.offers),
					needs: Array.from(p.presence.needs),
					mood: p.presence.mood,
					locationHash: p.presence.locationHash,
					expiry: p.presence.expiry,
					timestamp: p.presence.timestamp
				} : undefined
			});
		}

		localStorage.setItem('mycel_peers', JSON.stringify(data));
	} catch (e) {
		console.error('Failed to persist peers:', e);
	}
}
