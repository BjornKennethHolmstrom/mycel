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
	private subscriptions: Array<{ close: () => void }> = [];

	constructor(relays: string[] = DEFAULT_RELAYS) {
		this.pool = new SimplePool();
		this.relays = relays;
	}

	generateKeys(): { sk: Uint8Array; pk: string } {
		this.sk = generateSecretKey();
		this.pk = getPublicKey(this.sk);
		return { sk: this.sk, pk: this.pk };
	}

	loadKey(sk: Uint8Array) {
		this.sk = sk;
		this.pk = getPublicKey(sk);
	}

	get pubkey(): string {
		return this.pk;
	}

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
		if (pubkeys.length === 0) return null;

		const now = Math.floor(Date.now() / 1000);

		const sub = this.pool.subscribeMany(
			this.relays,
			[{
				kinds: [EVENT_KINDS.PRESENCE],
				authors: pubkeys,
				since: now - 7200
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

		this.subscriptions.push(sub);
		return sub;
	}

	/** Subscribe to gratitude events directed at a pubkey */
	subscribeGratitude(pubkey: string, onEvent: (from: string, note: string) => void) {
		const sub = this.pool.subscribeMany(
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

		this.subscriptions.push(sub);
		return sub;
	}

	/** Subscribe to vouch events directed at a pubkey */
	subscribeVouches(pubkey: string, onEvent: (from: string) => void) {
		const sub = this.pool.subscribeMany(
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

		this.subscriptions.push(sub);
		return sub;
	}

	/** Close all active subscriptions */
	closeSubscriptions() {
		for (const sub of this.subscriptions) {
			sub.close();
		}
		this.subscriptions = [];
	}

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
		this.closeSubscriptions();
		this.pool.close(this.relays);
	}
}
