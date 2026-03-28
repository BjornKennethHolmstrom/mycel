/**
 * Mycel trust scoring
 * Local-only trust computation based on interaction history with recency decay.
 * All scores are computed client-side. No server knows the trust graph.
 */

import { TRUST_WEIGHTS, DECAY_DAYS, type TrustEvent, type TrustEventType } from '$lib/types';

/** In-memory trust store. Replace with SQLite (sql.js) when persistence is needed. */
class TrustStore {
	/** Map of peer pubkey -> list of trust events */
	private events: Map<string, TrustEvent[]> = new Map();

	/** Record a trust-affecting event */
	record(peerPubkey: string, type: TrustEventType) {
		const events = this.events.get(peerPubkey) || [];
		events.push({
			peerPubkey,
			type,
			weight: TRUST_WEIGHTS[type],
			timestamp: Date.now()
		});
		this.events.set(peerPubkey, events);
	}

	/** Compute current trust score for a peer */
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

	/** Get all known peers sorted by trust score (descending) */
	allPeers(): Array<{ pubkey: string; score: number }> {
		const peers: Array<{ pubkey: string; score: number }> = [];

		for (const pubkey of this.events.keys()) {
			peers.push({ pubkey, score: this.score(pubkey) });
		}

		return peers.sort((a, b) => b.score - a.score);
	}

	/** Export all events (for persistence) */
	export(): Array<TrustEvent> {
		const all: TrustEvent[] = [];
		for (const events of this.events.values()) {
			all.push(...events);
		}
		return all;
	}

	/** Import events (from persistence) */
	import(events: TrustEvent[]) {
		for (const event of events) {
			const existing = this.events.get(event.peerPubkey) || [];
			existing.push(event);
			this.events.set(event.peerPubkey, existing);
		}
	}

	/** Clear all data */
	clear() {
		this.events.clear();
	}
}

export const trustStore = new TrustStore();
