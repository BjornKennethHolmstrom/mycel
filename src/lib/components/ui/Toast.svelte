<!--
	Toast
	A quiet, self-dismissing message. Fades in, sits briefly, fades out.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		message: string;
		duration?: number;
		ondismiss: () => void;
	}

	let { message, duration = 2000, ondismiss }: Props = $props();
	let visible = $state(false);

	onMount(() => {
		// Trigger fade-in on next frame
		requestAnimationFrame(() => { visible = true; });

		const timer = setTimeout(() => {
			visible = false;
			setTimeout(ondismiss, 300); // wait for fade-out
		}, duration);

		return () => clearTimeout(timer);
	});
</script>

<div class="toast" class:visible>
	{message}
</div>

<style>
	.toast {
		position: fixed;
		bottom: 5rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.5rem 1rem;
		border-radius: 1rem;
		background: var(--mycel-surface);
		border: 1px solid var(--mycel-border);
		color: var(--mycel-accent-bright);
		font-size: 0.75rem;
		z-index: 60;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.toast.visible {
		opacity: 1;
	}
</style>
