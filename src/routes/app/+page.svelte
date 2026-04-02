<!--
	Mycel app — the ambient map view.
	This is the primary interface. Not a feed. A living map.
-->
<script lang="ts">
 import { t, tv } from '$lib/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { hasIdentity, loadIdentity } from '$lib/nostr/keys';
	import { NostrClient } from '$lib/nostr/client';
	import { trustStore } from '$lib/trust/store';
 import { currentPubkey, peers, updatePeer, updatePresence, connectionStatus, persistPeers } from '$lib/stores/app';
 import { loadPeers } from '$lib/stores/peers';
	import type { Peer, PresenceData } from '$lib/types';
 import LangSwitcher from '$lib/components/ui/LangSwitcher.svelte';
 import AddPeerPanel from '$lib/components/presence/AddPeerPanel.svelte';
	import AmbientMap from '$lib/components/map/AmbientMap.svelte';
	import PresencePanel from '$lib/components/presence/PresencePanel.svelte';
	import PeerDetail from '$lib/components/presence/PeerDetail.svelte';
 import Toast from '$lib/components/ui/Toast.svelte';

	let client: NostrClient | null = null;
	let statusText = $state('connecting');
 let addPeerOpen = $state(false);
	let presenceOpen = $state(false);
	let myPresence = $state<PresenceData | null>(null);
	let selectedPeer = $state<Peer | null>(null);
 let toastMessage = $state('');
 let myDisplayName = $state(localStorage.getItem('mycel_display_name') || '');
 let republishTimer: ReturnType<typeof setInterval> | null = null;
 let relayHealth = $state({ connected: 0, total: 0 });
 let healthTimer: ReturnType<typeof setInterval> | null = null;

 onMount(() => {
     if (!hasIdentity()) {
         goto(`${base}/`);
         return;
     }

     const identity = loadIdentity()!;
     currentPubkey.set(identity.pk);

     myPresence = loadMyPresence();

     client = new NostrClient();
     client.loadKey(identity.sk);
     client.loadDisplayName();
     connectionStatus.set('connecting');

     // Load persisted peers, or create demo data on first run
     const savedPeers = loadPeers();
     if (savedPeers.length > 0) {
         for (const saved of savedPeers) {
             const score = trustStore.score(saved.pubkey);
             updatePeer(saved.pubkey, {
                 name: saved.name,
                 nip05: saved.nip05,
                 lastSeen: saved.lastSeen,
                 presence: saved.presence,
                 trustScore: score
             });
         }
     } else {
         addDemoPeers();
     }

     // Start live relay subscriptions
     startSubscriptions();
     // Poll relay health every 5 seconds
     healthTimer = setInterval(() => {
         if (client) {
             relayHealth = client.getRelayHealth();
         }
     }, 5000);
     // Initial check after 2 seconds (give connections time to establish)
     setTimeout(() => {
         if (client) relayHealth = client.getRelayHealth();
     }, 2000);
     connectionStatus.set('connected');
     statusText = 'connected';
     // Auto-republish presence every 30 minutes
     republishTimer = setInterval(() => {
         if (myPresence && client) {
             client.publishPresence(myPresence).catch(() => {
                 toastMessage = $t('app.publishFailed');
             });
         }
     }, 30 * 60 * 1000);
     persistPeers();
 });

 onDestroy(() => {
     if (republishTimer) clearInterval(republishTimer);
     if (healthTimer) clearInterval(healthTimer);
     client?.destroy();
 });

 function saveMyPresence(presence: PresenceData) {
     localStorage.setItem('mycel_my_presence', JSON.stringify(presence));
 }

 function loadMyPresence(): PresenceData | null {
     try {
         const raw = localStorage.getItem('mycel_my_presence');
         return raw ? JSON.parse(raw) : null;
     } catch {
         return null;
     }
 }

 function handleAddPeer(pubkey: string, name: string) {
     trustStore.record(pubkey, 'vouch');
     updatePeer(pubkey, {
         name: name || pubkey.slice(0, 8) + '…',
         trustScore: trustStore.score(pubkey)
     });
     toastMessage = $t('addPeer.peerAdded', { name: name || pubkey.slice(0, 8) });
     client?.publishVouch(pubkey);
     startSubscriptions();
     persistPeers();
 }

	function handlePeerSelect(peer: Peer) {
		selectedPeer = peer;
	}

 async function handlePublishPresence(presence: PresenceData, name: string) {
     myPresence = presence;
     saveMyPresence(presence);

     if (name !== myDisplayName) {
         myDisplayName = name;
         localStorage.setItem('mycel_display_name', name);
         client?.setDisplayName(name);
     }

     if (client) {
         try {
             await client.publishPresence(presence);
         } catch (err) {
             toastMessage = $t('app.publishFailed');
         }
     }
 }

 async function handleSendGratitude(pubkey: string) {
  if (client) {
   try {
    await client.publishGratitude(pubkey, '');
    trustStore.record(pubkey, 'gratitude_sent');
    updatePeer(pubkey, { trustScore: trustStore.score(pubkey) });
    const name = selectedPeer?.name || 'them';
    toastMessage = $t('peer.gratitudeSent', { name });
    selectedPeer = null;
    persistPeers();
   } catch (err) {
       toastMessage = $t('app.publishFailed');
   }
  }
 }

 function getPeer(pubkey: string): Peer | undefined {
  let found: Peer | undefined;
  peers.subscribe(($peers) => { found = $peers.get(pubkey); })();
  return found;
 }

 function handleRenamePeer(pubkey: string, name: string) {
     updatePeer(pubkey, { name });
     if (selectedPeer && selectedPeer.pubkey === pubkey) {
         selectedPeer = { ...selectedPeer, name };
     }
     persistPeers();
 }

 function handleForgetPeer(pubkey: string) {
     // Remove from peers store
     peers.update((map) => {
         map.delete(pubkey);
         return new Map(map);
     });
     // Remove trust history
     trustStore.forget(pubkey);
     selectedPeer = null;
     persistPeers();
     toastMessage = $t('peer.forgotten');
 }

 function startSubscriptions() {
     if (!client) return;

     // Close any existing subscriptions before restarting
     client.closeSubscriptions();

     // Collect all real peer pubkeys (skip demo peers with padded names)
     const peerPubkeys: string[] = [];
     peers.subscribe(($peers) => {
         for (const [pubkey, peer] of $peers) {
             // Real pubkeys are 64 hex chars, not padded names
             if (/^[0-9a-f]{64}$/i.test(pubkey)) {
                 peerPubkeys.push(pubkey);
             }
         }
     })();

     if (peerPubkeys.length === 0) return;

     console.log('Starting subscriptions for pubkeys: ' + peerPubkeys.join(', '));

     // Subscribe to presence from all known real peers
     client.subscribePresence(peerPubkeys, (pubkey, presence, broadcastName) => {
         updatePresence(pubkey, presence);
         trustStore.record(pubkey, 'presence_overlap');
         const peer = getPeer(pubkey);
         const updates: Partial<Peer> = { trustScore: trustStore.score(pubkey) };
         // Use broadcast name if we don't have a local name set
         if (broadcastName && (!peer?.name || peer.name === '' || peer.name === pubkey.slice(0, 8) + '…')) {
             updates.name = broadcastName;
         }
         updatePeer(pubkey, updates);
         persistPeers();
     });

     // Debug: also subscribe to ALL events from these pubkeys to see if anything comes through
     client.pool_debug.subscribeMany(
         ['wss://nos.lol', 'wss://relay.snort.social'],
         [{ authors: peerPubkeys, limit: 5 }],
         {
             onevent(event) {
                 console.log('Raw event from peer: kind=' + event.kind + ' pubkey=' + event.pubkey.slice(0, 8));
             },
             oneose() {
                 console.log('End of stored events from relays');
             }
         }
     );

     // Subscribe to gratitude directed at us
     let myPk = '';
     currentPubkey.subscribe((v) => { myPk = v; })();

     client.subscribeGratitude(myPk, (from, note) => {
         trustStore.record(from, 'gratitude_sent');
         updatePeer(from, { trustScore: trustStore.score(from) });
         const peer = getPeer(from);
         toastMessage = $t('peer.gratitudeSent', { name: peer?.name || from.slice(0, 8) });
     });

     // Debug: direct websocket subscription bypassing SimplePool
     const debugWs = new WebSocket('wss://relay.snort.social');
     debugWs.onopen = () => {
         const now = Math.floor(Date.now() / 1000);
         debugWs.send(JSON.stringify(["REQ", "debug-direct", {
             kinds: [30078],
             authors: peerPubkeys,
             since: now - 7200
         }]));
         console.log('Debug: sent direct subscription to relay.snort.social');
     };
     debugWs.onmessage = (e) => {
         const data = JSON.parse(e.data);
         if (data[0] === 'EVENT') {
             console.log('Debug: DIRECT got event from ' + data[2].pubkey.slice(0, 8));
         } else {
             console.log('Debug: DIRECT ' + JSON.stringify(data));
         }
     };
 }

	/** Demo data for development — remove when real peers exist */
	function addDemoPeers() {
		const demoNames = ['anna', 'erik', 'fatima', 'jun', 'maria', 'lars', 'sara'];
		const allOffers = ['tools', 'food', 'transport', 'seeds', 'firewood', 'company', 'conversation'];
		const allNeeds = ['firewood', 'childcare', 'transport', 'meal-together', 'skills', 'company'];

		for (const name of demoNames) {
			const fakePubkey = name.padEnd(64, '0');

			const interactions = Math.floor(Math.random() * 8) + 1;
			for (let i = 0; i < interactions; i++) {
				const types = ['gratitude_sent', 'dm_exchange', 'presence_overlap', 'offer_acted'] as const;
				trustStore.record(fakePubkey, types[Math.floor(Math.random() * types.length)]);
			}

			const score = trustStore.score(fakePubkey);
	 	const capacities = ['available', 'limited', 'unavailable'] as const;

			updatePeer(fakePubkey, {
				name,
				trustScore: score,
				presence: {
					capacity: capacities[Math.floor(Math.random() * 3)],
					offers: allOffers.slice(0, Math.floor(Math.random() * 4)),
					needs: allNeeds.slice(0, Math.floor(Math.random() * 3)),
					mood: (['calm', 'stretched', 'urgent'] as const)[Math.floor(Math.random() * 3)],
					expiry: 3600,
					timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600)
				}
			});
		}
	}
</script>

<div class="app-container">
 <header class="app-header">
     <span class="logo">mycel</span>
     <div style="display: flex; align-items: center; gap: 0.75rem;">
         <button class="add-peer-btn" onclick={() => addPeerOpen = true}>+</button>
         <LangSwitcher />
         <span class="status" class:connected={relayHealth.connected > 0}>
             <span class="relay-dot" style="background: {
                 relayHealth.connected === 0 ? 'var(--mycel-urgent)' :
                 relayHealth.connected < relayHealth.total ? 'var(--mycel-node-limited)' :
                 'var(--mycel-node-available)'
             }"></span>
             {relayHealth.connected}/{relayHealth.total}
         </span>
     </div>
 </header>

	<main class="map-area">
		<AmbientMap
    onpeerselect={handlePeerSelect}
    onselfselect={() => presenceOpen = true}
    myPresence={myPresence}
  />
	</main>

	<footer class="app-footer">
		<button class="presence-btn" onclick={() => presenceOpen = true}>
			{#if myPresence}
				<span class="presence-dot" style="background: {
					myPresence.capacity === 'available' ? 'var(--mycel-node-available)' :
					myPresence.capacity === 'limited' ? 'var(--mycel-node-limited)' :
					'var(--mycel-node-unavailable)'
				}"></span>
				<span>{$t(`presence.${myPresence.capacity}`)}</span>
				{#if myPresence.offers.length > 0}
					<span class="presence-detail">· {myPresence.offers.length} {$t('presence.offering')}</span>
				{/if}
			{:else}
				<span class="presence-dot" style="background: var(--mycel-node-unavailable)"></span>
				<span>{$t('presence.setPresence')}</span>
			{/if}
		</button>
	</footer>
</div>

<AddPeerPanel
 open={addPeerOpen}
 onclose={() => addPeerOpen = false}
 onadd={handleAddPeer}
/>

<PresencePanel
 open={presenceOpen}
 currentPresence={myPresence}
 displayName={myDisplayName}
 onpublish={handlePublishPresence}
 onclose={() => presenceOpen = false}
/>

<PeerDetail
 peer={selectedPeer}
 onclose={() => selectedPeer = null}
 ongratitude={handleSendGratitude}
 onrename={handleRenamePeer}
 onforget={handleForgetPeer}
/>

{#if toastMessage}
    <Toast message={toastMessage} ondismiss={() => toastMessage = ''} />
{/if}

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--mycel-border);
	}

	.logo {
		font-size: 0.875rem;
		font-weight: 300;
		letter-spacing: 0.15em;
		color: var(--mycel-accent-bright);
	}

 .relay-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.25rem;
 }

	.status {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--mycel-text-dim);
	}

	.status.connected {
		color: var(--mycel-node-available);
	}

 .add-peer-btn {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1px solid var(--mycel-border);
  background: transparent;
  color: var(--mycel-text-dim);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  line-height: 1;
 }

 .add-peer-btn:hover {
  border-color: var(--mycel-accent);
  color: var(--mycel-accent-bright);
 }

	.map-area {
		flex: 1;
		position: relative;
	}

	.app-footer {
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--mycel-border);
	}

	.presence-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-surface);
		color: var(--mycel-text);
		font-size: 0.75rem;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.presence-btn:hover {
		border-color: var(--mycel-accent);
	}

	.presence-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.presence-detail {
		color: var(--mycel-text-dim);
	}
</style>
