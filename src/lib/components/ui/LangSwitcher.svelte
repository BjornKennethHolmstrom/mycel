<!--
	Language switcher — compact toggle between supported locales.
-->
<script lang="ts">
	import { locale, SUPPORTED_LOCALES } from '$lib/i18n';

	function toggle() {
		locale.update((current) => {
			const idx = SUPPORTED_LOCALES.indexOf(current);
			return SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
		});
	}
</script>

<button class="lang-toggle" onclick={toggle} title="Switch language">
	{$locale.toUpperCase()}
</button>

<style>
	.lang-toggle {
		font-size: 0.5625rem;
		letter-spacing: 0.05em;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		border: 1px solid var(--mycel-border);
		background: transparent;
		color: var(--mycel-text-dim);
		cursor: pointer;
		transition: all 0.15s;
	}

	.lang-toggle:hover {
		border-color: var(--mycel-text-dim);
		color: var(--mycel-text);
	}
</style>
