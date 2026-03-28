<!--
	Mycel entry point.
	If the user has a key, go straight to the map.
	If not, show onboarding.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { hasIdentity, createIdentity, loadIdentity, importSecretKeyHex } from '$lib/nostr/keys';
	import { currentPubkey } from '$lib/stores/app';

	let showImport = $state(false);
	let importKey = $state('');
	let error = $state('');

	onMount(() => {
		if (hasIdentity()) {
			const identity = loadIdentity();
			if (identity) {
				currentPubkey.set(identity.pk);
				goto('/app');
			}
		}
	});

	function handleCreate() {
		const { pk } = createIdentity();
		currentPubkey.set(pk);
		goto('/app');
	}

	function handleImport() {
		try {
			const { pk } = importSecretKeyHex(importKey.trim());
			currentPubkey.set(pk);
			goto('/app');
		} catch {
			error = 'Invalid key. Please check and try again.';
		}
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
	<div class="max-w-md w-full space-y-8 text-center">
		<div class="space-y-2">
			<h1 class="text-3xl font-light tracking-wide" style="color: var(--mycel-accent-bright)">
				mycel
			</h1>
			<p class="text-sm" style="color: var(--mycel-text-dim)">
				coordination substrate for living communities
			</p>
		</div>

		<div class="space-y-4 pt-8">
			<button
				onclick={handleCreate}
				class="w-full py-3 px-6 rounded-lg text-sm font-medium transition-colors"
				style="background: var(--mycel-accent); color: var(--mycel-bg);"
			>
				Create new identity
			</button>

			<button
				onclick={() => showImport = !showImport}
				class="w-full py-3 px-6 rounded-lg text-sm transition-colors"
				style="background: var(--mycel-surface); color: var(--mycel-text-dim); border: 1px solid var(--mycel-border);"
			>
				I have a key
			</button>
		</div>

		{#if showImport}
			<div class="space-y-3 pt-2">
				<input
					type="password"
					bind:value={importKey}
					placeholder="Paste your secret key (hex)"
					class="w-full py-2 px-4 rounded-lg text-sm"
					style="background: var(--mycel-surface); color: var(--mycel-text); border: 1px solid var(--mycel-border);"
				/>
				{#if error}
					<p class="text-sm" style="color: var(--mycel-urgent)">{error}</p>
				{/if}
				<button
					onclick={handleImport}
					class="w-full py-2 px-6 rounded-lg text-sm transition-colors"
					style="background: var(--mycel-accent); color: var(--mycel-bg);"
				>
					Load key
				</button>
			</div>
		{/if}

		<p class="text-xs pt-8" style="color: var(--mycel-text-dim)">
			Your key is generated locally and never leaves your device.
		</p>
	</div>
</div>
