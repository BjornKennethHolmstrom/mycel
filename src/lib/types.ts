/** Mycel core types */

export interface Peer {
	pubkey: string;
	name?: string;
	nip05?: string;
	trustScore: number;
	lastSeen: number;
	presence?: PresenceData;
}

export interface PresenceData {
	capacity: 'available' | 'limited' | 'unavailable';
	offers: string[];
	needs: string[];
	mood?: 'calm' | 'stretched' | 'urgent';
	locationHash?: string;
	expiry: number;
	timestamp: number;
}

export interface TrustEvent {
	peerPubkey: string;
	type: TrustEventType;
	weight: number;
	timestamp: number;
}

export type TrustEventType =
	| 'coordination_complete'  // +5
	| 'offer_acted'            // +3
	| 'gratitude_sent'         // +2
	| 'vouch'                  // +2
	| 'dm_exchange'            // +1
	| 'presence_overlap';      // +0.5

export const TRUST_WEIGHTS: Record<TrustEventType, number> = {
	coordination_complete: 5,
	offer_acted: 3,
	gratitude_sent: 2,
	vouch: 2,
	dm_exchange: 1,
	presence_overlap: 0.5
};

/** Trust score halves every DECAY_DAYS days of no interaction */
export const DECAY_DAYS = 30;

export interface GratitudeEvent {
	from: string;
	to: string;
	note: string;
	timestamp: number;
}

export interface Constellation {
	id: string;
	members: string[];
	expiry: number;
	created: number;
}

/** Mycel custom Nostr event kinds (NIP-78 range) */
export const EVENT_KINDS = {
	PRESENCE: 30078,
	CONSTELLATION: 30079,
	GRATITUDE: 30080,
	VOUCH: 30081
} as const;

/** Default offer/need vocabulary */
export const VOCABULARY = [
	'tools', 'food', 'transport', 'shelter', 'skills', 'labor',
	'childcare', 'medical', 'firewood', 'water', 'electronics',
	'clothing', 'seeds', 'storage'
] as const;
