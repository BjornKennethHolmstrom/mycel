<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    let { children } = $props();

    onMount(() => {
        if (browser && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register(`/mycel/service-worker.js?v=${__BUILD_HASH__}`);
        }
    });
</script>

{@render children()}
