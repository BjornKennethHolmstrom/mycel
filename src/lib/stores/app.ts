/**
 * Mycel reactive stores
 * Svelte 5 uses runes ($state, $derived) in components, but for cross-component
 * state we use writable stores from svelte/store.
 */

import { writable, derived } from 'svelte/store';
import type { Peer, PresenceData } from '$lib/types';

/** Current user's public key */
export const currentPubkey = writable<string>('');

/** Whether the user has loaded/generated keys */
export const isAuthenticated = derived(currentPubkey, ($pk) => $pk.length > 0);

/** All known peers, keyed by pubkey */
export const peers = writable<Map<string, Peer>>(new Map());

import { savePeers } from '$lib/stores/peers';

function scheduleSave() {
    // Use setTimeout to break out of the reactive cycle
    setTimeout(() => {
        const map = new Map<string, Peer>();
        peers.subscribe(($p) => {
            for (const [k, v] of $p) {
                map.set(k, {
                    pubkey: v.pubkey,
                    name: v.name,
                    nip05: v.nip05,
                    trustScore: v.trustScore,
                    lastSeen: v.lastSeen,
                    presence: v.presence ? {
                        capacity: v.presence.capacity,
                        offers: [...v.presence.offers],
                        needs: [...v.presence.needs],
                        mood: v.presence.mood,
                        locationHash: v.presence.locationHash,
                        expiry: v.presence.expiry,
                        timestamp: v.presence.timestamp
                    } : undefined
                });
            }
        })();
        savePeers(map);
    }, 0);
}

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
    scheduleSave();
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
    scheduleSave();
}

/** Peers as a sorted array (by trust score, descending) */
export const peerList = derived(peers, ($peers) => {
	return Array.from($peers.values()).sort((a, b) => b.trustScore - a.trustScore);
});

/** Connection status */
export const connectionStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected');
