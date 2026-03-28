/**
 * Mycel Nostr client
 * Wraps nostr-tools to handle relay connections, event publishing, and subscriptions.
 */

import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import { EVENT_KINDS, type PresenceData } from '$lib/types';

const DEFAULT_RELAYS = [
	'wss://relay.damus.io',
	'wss://nos.lol',
	'wss://relay.nostr.band'
];

export class NostrClient {
	private pool: SimplePool;
	private sk: Uint8Array | null = null;
	private pk: string = '';
	private relays: string[];

	constructor(relays: string[] = DEFAULT_RELAYS) {
		this.pool = new SimplePool();
		this.relays = relays;
	}

	/** Generate a new keypair */
	generateKeys(): { sk: Uint8Array; pk: string } {
		this.sk = generateSecretKey();
		this.pk = getPublicKey(this.sk);
		return { sk: this.sk, pk: this.pk };
	}

	/** Load existing secret key */
	loadKey(sk: Uint8Array) {
		this.sk = sk;
		this.pk = getPublicKey(sk);
	}

	get pubkey(): string {
		return this.pk;
	}

	/** Publish a presence event */
	async publishPresence(presence: PresenceData): Promise<void> {
		if (!this.sk) throw new Error('No key loaded');

		const event = finalizeEvent({
			kind: EVENT_KINDS.PRESENCE,
			created_at: Math.floor(Date.now() / 1000),
			tags: [
				['d', 'presence'],
				['expiry', String(presence.expiry)]
			],
			content: JSON.stringify({
				mycel_type: 'presence',
				capacity: presence.capacity,
				offers: presence.offers,
				needs: presence.needs,
				mood: presence.mood,
				location_hash: presence.locationHash
			})
		}, this.sk);

		await Promise.any(this.pool.publish(this.relays, event));
	}

	/** Publish a gratitude event */
	async publishGratitude(toPubkey: string, note: string): Promise<void> {
		if (!this.sk) throw new Error('No key loaded');

		const event = finalizeEvent({
			kind: EVENT_KINDS.GRATITUDE,
			created_at: Math.floor(Date.now() / 1000),
			tags: [['p', toPubkey]],
			content: JSON.stringify({
				mycel_type: 'gratitude',
				to: toPubkey,
				note
			})
		}, this.sk);

		await Promise.any(this.pool.publish(this.relays, event));
	}

	/** Publish a vouch event */
	async publishVouch(forPubkey: string): Promise<void> {
		if (!this.sk) throw new Error('No key loaded');

		const event = finalizeEvent({
			kind: EVENT_KINDS.VOUCH,
			created_at: Math.floor(Date.now() / 1000),
			tags: [['p', forPubkey]],
			content: JSON.stringify({
				mycel_type: 'vouch',
				for: forPubkey
			})
		}, this.sk);

		await Promise.any(this.pool.publish(this.relays, event));
	}

	/** Subscribe to presence events from a set of pubkeys */
	subscribePresence(pubkeys: string[], onEvent: (pubkey: string, presence: PresenceData) => void) {
		const now = Math.floor(Date.now() / 1000);

		return this.pool.subscribeMany(
			this.relays,
			[{
				kinds: [EVENT_KINDS.PRESENCE],
				authors: pubkeys,
				since: now - 7200 // last 2 hours
			}],
			{
				onevent(event) {
					try {
						const data = JSON.parse(event.content);
						if (data.mycel_type !== 'presence') return;

						const presence: PresenceData = {
							capacity: data.capacity,
							offers: data.offers || [],
							needs: data.needs || [],
							mood: data.mood,
							locationHash: data.location_hash,
							expiry: Number(event.tags.find(t => t[0] === 'expiry')?.[1] || 3600),
							timestamp: event.created_at
						};

						onEvent(event.pubkey, presence);
					} catch {
						// skip malformed events
					}
				}
			}
		);
	}

	/** Subscribe to gratitude events for a pubkey */
	subscribeGratitude(pubkey: string, onEvent: (from: string, note: string) => void) {
		return this.pool.subscribeMany(
			this.relays,
			[{
				kinds: [EVENT_KINDS.GRATITUDE],
				'#p': [pubkey]
			}],
			{
				onevent(event) {
					try {
						const data = JSON.parse(event.content);
						if (data.mycel_type !== 'gratitude') return;
						onEvent(event.pubkey, data.note);
					} catch {
						// skip
					}
				}
			}
		);
	}

	/** Subscribe to vouch events for a pubkey */
	subscribeVouches(pubkey: string, onEvent: (from: string) => void) {
		return this.pool.subscribeMany(
			this.relays,
			[{
				kinds: [EVENT_KINDS.VOUCH],
				'#p': [pubkey]
			}],
			{
				onevent(event) {
					try {
						const data = JSON.parse(event.content);
						if (data.mycel_type !== 'vouch') return;
						onEvent(event.pubkey);
					} catch {
						// skip
					}
				}
			}
		);
	}

	/** Fetch profile metadata (kind 0) for a pubkey */
	async fetchProfile(pubkey: string): Promise<{ name?: string; nip05?: string } | null> {
		const event = await this.pool.get(this.relays, {
			kinds: [0],
			authors: [pubkey]
		});

		if (!event) return null;

		try {
			const profile = JSON.parse(event.content);
			return { name: profile.name || profile.display_name, nip05: profile.nip05 };
		} catch {
			return null;
		}
	}

	destroy() {
		this.pool.close(this.relays);
	}
}
