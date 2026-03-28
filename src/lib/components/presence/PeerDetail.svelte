<!--
	Peer Detail Panel
	Shows when you tap a node on the ambient map.
	Displays presence info, offers, needs, and actions (gratitude, DM).
-->
<script lang="ts">
 import { get } from 'svelte/store';
 import { t, tv } from '$lib/i18n';
	import type { Peer } from '$lib/types';

	interface Props {
		peer: Peer | null;
		onclose: () => void;
		ongratitude: (pubkey: string) => void;
	}

	let { peer, onclose, ongratitude }: Props = $props();

	function capacityColor(capacity: string | undefined): string {
		if (capacity === 'available') return 'var(--mycel-node-available)';
		if (capacity === 'limited') return 'var(--mycel-node-limited)';
		return 'var(--mycel-node-unavailable)';
	}

 function timeAgo(timestamp: number): string {
  const translate = get(t);
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return translate('peer.justNow');
  if (seconds < 3600) return translate('peer.minutesAgo', { n: String(Math.floor(seconds / 60)) });
  if (seconds < 86400) return translate('peer.hoursAgo', { n: String(Math.floor(seconds / 3600)) });
  return translate('peer.daysAgo', { n: String(Math.floor(seconds / 86400)) });
 }
</script>

{#if peer}
	<button class="backdrop" onclick={onclose} aria-label="Close panel"></button>

	<div class="panel">
		<div class="handle-bar">
			<div class="handle"></div>
		</div>

		<!-- Header -->
		<div class="peer-header">
			<div class="peer-node" style="background: {capacityColor(peer.presence?.capacity)}"></div>
			<div class="peer-info">
				<span class="peer-name">{peer.name || peer.pubkey.slice(0, 12) + '…'}</span>
				<span class="peer-meta">
     <span class="capacity-label" style="color: {capacityColor(peer.presence?.capacity)}">
      {$t(`presence.${peer.presence?.capacity ?? 'unavailable'}`)}
     </span>
     {#if peer.presence?.mood}
      <span class="separator">·</span>
      <span>{$t(`presence.${peer.presence.mood}`)}</span>
     {/if}
     {#if peer.presence?.timestamp}
      <span class="separator">·</span>
      <span>{timeAgo(peer.presence.timestamp)}</span>
     {/if}
				</span>
			</div>
   <div class="trust-score">
    <span class="trust-label">{$t('peer.trustScore')}</span>
    {peer.trustScore.toFixed(1)}
   </div>
		</div>

		<!-- Offers -->
		{#if peer.presence?.offers && peer.presence.offers.length > 0}
			<section>
				<h3 class="section-label">{$t('peer.offering')}</h3>
				<div class="tag-row">
     {#each peer.presence.offers as tag}
      <span class="tag tag-offer">{$tv(tag)}</span>
     {/each}
				</div>
			</section>
		{/if}

		<!-- Needs -->
		{#if peer.presence?.needs && peer.presence.needs.length > 0}
			<section>
				<h3 class="section-label">{$t('peer.couldUse')}</h3>
				<div class="tag-row">
     {#each peer.presence.needs as tag}
      <span class="tag tag-need">{$tv(tag)}</span>
     {/each}
				</div>
			</section>
		{/if}

		<!-- No presence -->
		{#if !peer.presence}
			<p class="no-presence">No presence signal right now.</p>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button class="action-btn gratitude-btn" onclick={() => ongratitude(peer!.pubkey)}>
				{$t('peer.sendGratitude')}
			</button>
		</div>
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
		padding: 0.5rem 0 0.75rem;
	}

	.handle {
		width: 2rem;
		height: 3px;
		border-radius: 2px;
		background: var(--mycel-border);
	}

	.peer-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.peer-node {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.peer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.peer-name {
		font-size: 0.9375rem;
		color: var(--mycel-text);
	}

	.peer-meta {
		font-size: 0.6875rem;
		color: var(--mycel-text-dim);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.capacity-label {
		font-weight: 500;
	}

	.separator {
		opacity: 0.4;
	}

 .trust-label {
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
 }

 .trust-score {
  font-size: 0.75rem;
  color: var(--mycel-text-dim);
  background: var(--mycel-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
 }

	section {
		margin-bottom: 1rem;
	}

	.section-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--mycel-text-dim);
		margin-bottom: 0.375rem;
		font-weight: 400;
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.tag {
		padding: 0.25rem 0.625rem;
		border-radius: 1rem;
		font-size: 0.6875rem;
	}

	.tag-offer {
		border: 1px solid var(--mycel-accent-bright);
		color: var(--mycel-accent-bright);
		background: rgba(106, 173, 122, 0.08);
	}

	.tag-need {
		border: 1px solid var(--mycel-urgent);
		color: var(--mycel-urgent);
		background: rgba(196, 122, 58, 0.08);
	}

	.no-presence {
		font-size: 0.75rem;
		color: var(--mycel-text-dim);
		font-style: italic;
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		flex: 1;
		padding: 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.gratitude-btn {
		border: 1px solid var(--mycel-accent);
		background: transparent;
		color: var(--mycel-accent-bright);
	}

	.gratitude-btn:hover {
		background: rgba(74, 124, 89, 0.1);
	}
</style>
