/**
 * Mycel trust scoring
 * Local-only trust computation based on interaction history with recency decay.
 * All scores are computed client-side. No server knows the trust graph.
 * Persists to localStorage.
 */

import { TRUST_WEIGHTS, DECAY_DAYS, type TrustEvent, type TrustEventType } from '$lib/types';

const STORAGE_KEY = 'mycel_trust_events';

class TrustStore {
	private events: Map<string, TrustEvent[]> = new Map();

	constructor() {
		this.load();
	}

	record(peerPubkey: string, type: TrustEventType) {
		const events = this.events.get(peerPubkey) || [];
		events.push({
			peerPubkey,
			type,
			weight: TRUST_WEIGHTS[type],
			timestamp: Date.now()
		});
		this.events.set(peerPubkey, events);
		this.save();
	}

	score(peerPubkey: string): number {
		const events = this.events.get(peerPubkey);
		if (!events || events.length === 0) return 0;

		const now = Date.now();
		let total = 0;

		for (const event of events) {
			const daysSince = (now - event.timestamp) / (1000 * 60 * 60 * 24);
			const decay = Math.pow(0.5, daysSince / DECAY_DAYS);
			total += event.weight * decay;
		}

		return Math.round(total * 100) / 100;
	}

	allPeers(): Array<{ pubkey: string; score: number }> {
		const peers: Array<{ pubkey: string; score: number }> = [];

		for (const pubkey of this.events.keys()) {
			peers.push({ pubkey, score: this.score(pubkey) });
		}

		return peers.sort((a, b) => b.score - a.score);
	}

	private save() {
		try {
			const all: TrustEvent[] = [];
			for (const events of this.events.values()) {
				all.push(...events);
			}
			localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
		} catch {
			// storage full or unavailable — silently continue
		}
	}

	private load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;

			const events: TrustEvent[] = JSON.parse(raw);
			for (const event of events) {
				const existing = this.events.get(event.peerPubkey) || [];
				existing.push(event);
				this.events.set(event.peerPubkey, existing);
			}
		} catch {
			// corrupt data — start fresh
		}
	}

 forget(peerPubkey: string) {
     this.events.delete(peerPubkey);
     this.save();
 }

	clear() {
		this.events.clear();
		localStorage.removeItem(STORAGE_KEY);
	}
}

export const trustStore = new TrustStore();
