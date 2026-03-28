<!--
	Mycel entry point.
	If the user has a key, go straight to the map.
	If not, show onboarding.
-->
<script lang="ts">
 import { t, tv } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
 import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { hasIdentity, createIdentity, loadIdentity, importSecretKeyHex } from '$lib/nostr/keys';
	import { currentPubkey } from '$lib/stores/app';
 import LangSwitcher from '$lib/components/ui/LangSwitcher.svelte';

	let showImport = $state(false);
	let importKey = $state('');
	let error = $state('');

	onMount(() => {
		if (hasIdentity()) {
			const identity = loadIdentity();
			if (identity) {
				currentPubkey.set(identity.pk);
    goto(`${base}/app`)
			}
		}
	});

	function handleCreate() {
		const { pk } = createIdentity();
		currentPubkey.set(pk);
  goto(`${base}/app`)
	}

	function handleImport() {
		try {
			const { pk } = importSecretKeyHex(importKey.trim());
			currentPubkey.set(pk);
    goto(`${base}/app`)
		} catch {
			error = $t('onboarding.invalidKey');
		}
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
 <div style="position: absolute; top: 1rem; right: 1rem;">
     <LangSwitcher />
 </div>
	<div class="max-w-md w-full space-y-8 text-center">
		<div class="space-y-2">
			<h1 class="text-3xl font-light tracking-wide" style="color: var(--mycel-accent-bright)">
				{$t('app.name')}
			</h1>
			<p class="text-sm" style="color: var(--mycel-text-dim)">
				{$t('app.tagline')}
			</p>
		</div>

		<div class="space-y-4 pt-8">
			<button
				onclick={handleCreate}
				class="w-full py-3 px-6 rounded-lg text-sm font-medium transition-colors"
				style="background: var(--mycel-accent); color: var(--mycel-bg);"
			>
				{$t('onboarding.create')}
			</button>

			<button
				onclick={() => showImport = !showImport}
				class="w-full py-3 px-6 rounded-lg text-sm transition-colors"
				style="background: var(--mycel-surface); color: var(--mycel-text-dim); border: 1px solid var(--mycel-border);"
			>
				{$t('onboarding.haveKey')}
			</button>
		</div>

		{#if showImport}
			<div class="space-y-3 pt-2">
				<input
					type="password"
					bind:value={importKey}
					placeholder={$t('onboarding.pasteKey')}
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
					{$t('onboarding.loadKey')}
				</button>
			</div>
		{/if}

		<p class="text-xs pt-8" style="color: var(--mycel-text-dim)">
			{$t('onboarding.keyLocal')}
		</p>
	</div>
</div>
