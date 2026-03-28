<!--
	Add Peer Panel
	Add a peer by pasting their public key (hex or npub).
	Also shows your own pubkey for sharing.
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { currentPubkey } from '$lib/stores/app';

	interface Props {
		open: boolean;
		onclose: () => void;
		onadd: (pubkey: string, name: string) => void;
	}

	let { open, onclose, onadd }: Props = $props();

	let peerKey = $state('');
	let peerName = $state('');
	let error = $state('');
	let copied = $state(false);

	function handleAdd() {
		const key = peerKey.trim();

		if (!key) {
			error = $t('addPeer.errorEmpty');
			return;
		}

		// Accept hex (64 chars) or npub format
		let hexKey = key;

		if (key.startsWith('npub1')) {
			try {
				// Basic bech32 decode - for full support use nostr-tools nip19
				// For now accept hex only, show helpful error for npub
				error = $t('addPeer.errorNpub');
				return;
			} catch {
				error = $t('addPeer.errorInvalid');
				return;
			}
		}

		if (!/^[0-9a-f]{64}$/i.test(hexKey)) {
			error = $t('addPeer.errorInvalid');
			return;
		}

		onadd(hexKey, peerName.trim());
		peerKey = '';
		peerName = '';
		error = '';
		onclose();
	}

	async function copyOwnKey() {
		try {
			let pk = '';
			currentPubkey.subscribe((v) => { pk = v; })();
			await navigator.clipboard.writeText(pk);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch {
			// clipboard API not available
		}
	}
</script>

{#if open}
	<button class="backdrop" onclick={onclose} aria-label="Close panel"></button>

	<div class="panel">
		<div class="handle-bar">
			<div class="handle"></div>
		</div>

		<!-- Share your key -->
		<section>
			<h3 class="section-label">{$t('addPeer.yourKey')}</h3>
			<button class="copy-btn" onclick={copyOwnKey}>
				<span class="key-display">{$currentPubkey.slice(0, 16)}…{$currentPubkey.slice(-8)}</span>
				<span class="copy-label">{copied ? $t('addPeer.copied') : $t('addPeer.copy')}</span>
			</button>
			<p class="hint">{$t('addPeer.shareHint')}</p>
		</section>

		<!-- Add someone -->
		<section>
			<h3 class="section-label">{$t('addPeer.addSomeone')}</h3>
			<input
				type="text"
				bind:value={peerName}
				placeholder={$t('addPeer.namePlaceholder')}
				class="input"
			/>
			<input
				type="text"
				bind:value={peerKey}
				placeholder={$t('addPeer.keyPlaceholder')}
				class="input mono"
			/>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<button class="add-btn" onclick={handleAdd}>
				{$t('addPeer.add')}
			</button>
		</section>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 40;
		border: none;
		cursor: default;
	}

	.panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-height: 75dvh;
		overflow-y: auto;
		background: var(--mycel-surface);
		border-top: 1px solid var(--mycel-border);
		border-radius: 1rem 1rem 0 0;
		padding: 0.5rem 1.25rem 2rem;
		z-index: 50;
		animation: slide-up 0.2s ease-out;
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.handle-bar {
		display: flex;
		justify-content: center;
		padding: 0.5rem 0 1rem;
	}

	.handle {
		width: 2rem;
		height: 3px;
		border-radius: 2px;
		background: var(--mycel-border);
	}

	section {
		margin-bottom: 1.25rem;
	}

	.section-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--mycel-text-dim);
		margin-bottom: 0.5rem;
		font-weight: 400;
	}

	.copy-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-bg);
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.copy-btn:hover {
		border-color: var(--mycel-accent);
	}

	.key-display {
		font-family: monospace;
		font-size: 0.6875rem;
		color: var(--mycel-text-dim);
	}

	.copy-label {
		font-size: 0.6875rem;
		color: var(--mycel-accent-bright);
	}

	.hint {
		font-size: 0.625rem;
		color: var(--mycel-text-dim);
		margin-top: 0.375rem;
	}

	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-bg);
		color: var(--mycel-text);
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
		box-sizing: border-box;
	}

	.input::placeholder {
		color: var(--mycel-text-dim);
	}

	.input.mono {
		font-family: monospace;
		font-size: 0.6875rem;
	}

	.error {
		font-size: 0.6875rem;
		color: var(--mycel-urgent);
		margin-bottom: 0.5rem;
	}

	.add-btn {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--mycel-accent);
		color: var(--mycel-bg);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.add-btn:hover {
		background: var(--mycel-accent-bright);
	}
</style>
