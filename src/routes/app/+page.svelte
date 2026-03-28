<!--
	Mycel app — the ambient map view.
	This is the primary interface. Not a feed. A living map.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
 import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { hasIdentity, loadIdentity } from '$lib/nostr/keys';
	import { NostrClient } from '$lib/nostr/client';
	import { trustStore } from '$lib/trust/store';
	import { currentPubkey, updatePeer, updatePresence, connectionStatus } from '$lib/stores/app';
	import AmbientMap from '$lib/components/map/AmbientMap.svelte';

	let client: NostrClient | null = null;
	let statusText = $state('connecting…');

	onMount(() => {
		if (!hasIdentity()) {
			goto('${base}/');
			return;
		}

		const identity = loadIdentity()!;
		currentPubkey.set(identity.pk);

		// Initialize Nostr client
		client = new NostrClient();
		client.loadKey(identity.sk);
		connectionStatus.set('connecting');

		// For Phase 0 demo: add some seed peers if trust store is empty
		if (trustStore.allPeers().length === 0) {
			addDemoPeers();
		}

		// Load trust scores into peer store
		for (const { pubkey, score } of trustStore.allPeers()) {
			updatePeer(pubkey, { trustScore: score });
		}

		connectionStatus.set('connected');
		statusText = 'connected';
	});

	onDestroy(() => {
		client?.destroy();
	});

	/** Demo data for development — remove when real peers exist */
	function addDemoPeers() {
		const demoNames = ['anna', 'erik', 'fatima', 'jun', 'maria', 'lars', 'sara'];

		for (const name of demoNames) {
			// Generate a deterministic-ish fake pubkey from name
			const fakePubkey = name.padEnd(64, '0');

			// Simulate some trust history
			const interactions = Math.floor(Math.random() * 8) + 1;
			for (let i = 0; i < interactions; i++) {
				const types = ['gratitude_sent', 'dm_exchange', 'presence_overlap', 'offer_acted'] as const;
				trustStore.record(fakePubkey, types[Math.floor(Math.random() * types.length)]);
			}

			const score = trustStore.score(fakePubkey);
			const capacities = ['available', 'limited', 'unavailable'] as const;
			const offers = ['tools', 'food', 'transport', 'seeds', 'firewood'];

			updatePeer(fakePubkey, {
				name,
				trustScore: score,
				presence: {
					capacity: capacities[Math.floor(Math.random() * 3)],
					offers: offers.slice(0, Math.floor(Math.random() * 3)),
					needs: [],
					mood: 'calm',
					expiry: 3600,
					timestamp: Math.floor(Date.now() / 1000)
				}
			});
		}
	}
</script>

<div class="app-container">
	<header class="app-header">
		<span class="logo">mycel</span>
		<span class="status" class:connected={statusText === 'connected'}>
			{statusText}
		</span>
	</header>

	<main class="map-area">
		<AmbientMap />
	</main>
</div>

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

	.status {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--mycel-text-dim);
	}

	.status.connected {
		color: var(--mycel-node-available);
	}

	.map-area {
		flex: 1;
		position: relative;
	}
</style>
