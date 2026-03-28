/**
 * Mycel Nostr client
 * Wraps nostr-tools to handle relay connections, event publishing, and subscriptions.
 */

import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import { EVENT_KINDS, type PresenceData } from '$lib/types';

const DEFAULT_RELAYS = [
	'wss://nos.lol',
	'wss://relay.snort.social',
	'wss://relay.primal.net',
	'wss://nostr.mom'
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

 get pool_debug(): SimplePool {
     return this.pool;
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

     const results = this.pool.publish(this.relays, event);
     for (let i = 0; i < this.relays.length; i++) {
         results[i]
             .then(() => console.log('✓ Published presence to', this.relays[i]))
             .catch((err: unknown) => console.log('✗ Presence failed on', this.relays[i], err));
     }
     await Promise.any(results);
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

     const results = this.pool.publish(this.relays, event);
     for (let i = 0; i < this.relays.length; i++) {
         results[i]
             .then(() => console.log('✓ Published gratitude to', this.relays[i]))
             .catch((err: unknown) => console.log('✗ Gratitude failed on', this.relays[i], err));
     }
     await Promise.any(results);
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

     const results = this.pool.publish(this.relays, event);
     for (let i = 0; i < this.relays.length; i++) {
         results[i]
             .then(() => console.log('✓ Published vouch to', this.relays[i]))
             .catch((err: unknown) => console.log('✗ Vouch failed on', this.relays[i], err));
     }
     await Promise.any(results);
 }
	/** Subscribe to presence events from a set of pubkeys */
 subscribePresence(pubkeys: string[], onEvent: (pubkey: string, presence: PresenceData) => void) {
     if (pubkeys.length === 0) return null;

     const now = Math.floor(Date.now() / 1000);
     const filter = JSON.stringify(["REQ", "mycel-presence", {
         kinds: [EVENT_KINDS.PRESENCE],
         authors: pubkeys,
         since: now - 7200
     }]);

     for (const relay of this.relays) {
         try {
             const ws = new WebSocket(relay);

             ws.onopen = () => {
                 console.log('Subscription connected to', relay);
                 ws.send(filter);
             };

             ws.onmessage = (e) => {
                 try {
                     const msg = JSON.parse(e.data);
                     if (msg[0] !== 'EVENT') return;

                     const event = msg[2];
                     const data = JSON.parse(event.content);
                     if (data.mycel_type !== 'presence') return;

                     const presence: PresenceData = {
                         capacity: data.capacity,
                         offers: data.offers || [],
                         needs: data.needs || [],
                         mood: data.mood,
                         locationHash: data.location_hash,
                         expiry: Number(event.tags.find((t: string[]) => t[0] === 'expiry')?.[1] || 3600),
                         timestamp: event.created_at
                     };

                     console.log('Presence received from', event.pubkey.slice(0, 8), 'via', relay);
                     onEvent(event.pubkey, presence);
                 } catch {
                     // skip
                 }
             };

             ws.onerror = () => console.log('Subscription failed on', relay);

             this.subscriptions.push({ close: () => ws.close() });
         } catch {
             console.log('Could not connect to', relay);
         }
     }

     return this.subscriptions[this.subscriptions.length - 1];
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
