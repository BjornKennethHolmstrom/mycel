<!--
	Presence Panel
	A quiet bottom drawer for setting your presence: name, capacity, offers, needs, mood.
	Publishes a presence event to relays when you update.
-->
<script lang="ts">
	import { t, tv } from '$lib/i18n';
	import { VOCABULARY } from '$lib/types';
	import type { PresenceData } from '$lib/types';

	interface Props {
		open: boolean;
		currentPresence: PresenceData | null;
		displayName: string;
		onpublish: (presence: PresenceData, name: string) => void;
		onclose: () => void;
	}

	let { open, currentPresence, displayName, onpublish, onclose }: Props = $props();

	let name = $state(displayName || '');
	let capacity = $state<'available' | 'limited' | 'unavailable'>(
		currentPresence?.capacity ?? 'available'
	);
	let mood = $state<'calm' | 'stretched' | 'urgent'>(
		currentPresence?.mood ?? 'calm'
	);
	let selectedOffers = $state<Set<string>>(
		new Set(currentPresence?.offers ?? [])
	);
	let selectedNeeds = $state<Set<string>>(
		new Set(currentPresence?.needs ?? [])
	);

	// Sync when panel reopens with new props
	$effect(() => {
		if (open) {
			name = displayName || '';
			capacity = currentPresence?.capacity ?? 'available';
			mood = currentPresence?.mood ?? 'calm';
			selectedOffers = new Set(currentPresence?.offers ?? []);
			selectedNeeds = new Set(currentPresence?.needs ?? []);
		}
	});

	function toggleOffer(tag: string) {
		const next = new Set(selectedOffers);
		if (next.has(tag)) next.delete(tag);
		else next.add(tag);
		selectedOffers = next;
	}

	function toggleNeed(tag: string) {
		const next = new Set(selectedNeeds);
		if (next.has(tag)) next.delete(tag);
		else next.add(tag);
		selectedNeeds = next;
	}

	function handlePublish() {
		onpublish({
			capacity,
			offers: Array.from(selectedOffers),
			needs: Array.from(selectedNeeds),
			mood,
			expiry: 3600,
			timestamp: Math.floor(Date.now() / 1000)
		}, name.trim());
		onclose();
	}

	const capacityOptions = [
		{ value: 'available', color: 'var(--mycel-node-available)' },
		{ value: 'limited', color: 'var(--mycel-node-limited)' },
		{ value: 'unavailable', color: 'var(--mycel-node-unavailable)' }
	] as const;

	const moodOptions = [
		{ value: 'calm' },
		{ value: 'stretched' },
		{ value: 'urgent' }
	] as const;
</script>

{#if open}
	<button class="backdrop" onclick={onclose} aria-label="Close panel"></button>

	<div class="panel">
		<div class="handle-bar">
			<div class="handle"></div>
		</div>

		<!-- Display name -->
		<section>
			<h3 class="section-label">{$t('presence.name')}</h3>
			<input
				type="text"
				bind:value={name}
				placeholder={$t('presence.namePlaceholder')}
				class="name-input"
			/>
		</section>

		<!-- Capacity -->
		<section>
			<h3 class="section-label">{$t('presence.capacity')}</h3>
			<div class="option-row">
				{#each capacityOptions as opt}
					<button
						class="capacity-btn"
						class:selected={capacity === opt.value}
						style="--dot-color: {opt.color}"
						onclick={() => capacity = opt.value}
					>
						<span class="dot"></span>
						{$t(`presence.${opt.value}`)}
					</button>
				{/each}
			</div>
		</section>

		<!-- Mood -->
		<section>
			<h3 class="section-label">{$t('presence.mood')}</h3>
			<div class="option-row">
				{#each moodOptions as opt}
					<button
						class="mood-btn"
						class:selected={mood === opt.value}
						onclick={() => mood = opt.value}
					>
						{$t(`presence.${opt.value}`)}
					</button>
				{/each}
			</div>
		</section>

		<!-- Offers -->
		<section>
			<h3 class="section-label">{$t('presence.offers')}</h3>
			<div class="tag-grid">
				{#each VOCABULARY as tag}
					<button
						class="tag"
						class:tag-offer-selected={selectedOffers.has(tag)}
						onclick={() => toggleOffer(tag)}
					>
						{$tv(tag)}
					</button>
				{/each}
			</div>
		</section>

		<!-- Needs -->
		<section>
			<h3 class="section-label">{$t('presence.needs')}</h3>
			<div class="tag-grid">
				{#each VOCABULARY as tag}
					<button
						class="tag"
						class:tag-need-selected={selectedNeeds.has(tag)}
						onclick={() => toggleNeed(tag)}
					>
						{$tv(tag)}
					</button>
				{/each}
			</div>
		</section>

		<!-- Publish -->
		<button class="publish-btn" onclick={handlePublish}>
			{$t('presence.updatePresence')}
		</button>
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

	.name-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: var(--mycel-bg);
		color: var(--mycel-text);
		font-size: 0.8125rem;
		box-sizing: border-box;
	}

	.name-input::placeholder {
		color: var(--mycel-text-dim);
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
	}

	.capacity-btn, .mood-btn {
		flex: 1;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--mycel-border);
		background: transparent;
		color: var(--mycel-text-dim);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
	}

	.capacity-btn.selected, .mood-btn.selected {
		border-color: var(--mycel-accent);
		color: var(--mycel-text);
		background: rgba(74, 124, 89, 0.1);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--dot-color);
	}

	.tag-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.tag {
		padding: 0.3rem 0.625rem;
		border-radius: 1rem;
		border: 1px solid var(--mycel-border);
		background: transparent;
		color: var(--mycel-text-dim);
		font-size: 0.6875rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.tag:hover {
		border-color: var(--mycel-text-dim);
	}

	.tag-offer-selected {
		border-color: var(--mycel-accent-bright);
		color: var(--mycel-accent-bright);
		background: rgba(106, 173, 122, 0.1);
	}

	.tag-need-selected {
		border-color: var(--mycel-urgent);
		color: var(--mycel-urgent);
		background: rgba(196, 122, 58, 0.1);
	}

	.publish-btn {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--mycel-accent);
		color: var(--mycel-bg);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: background 0.15s;
	}

	.publish-btn:hover {
		background: var(--mycel-accent-bright);
	}
</style>
