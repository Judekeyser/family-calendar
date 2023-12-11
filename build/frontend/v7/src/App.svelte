<script>
    import computeState from "./backend/state.js";
    import { readable } from 'svelte/store'
    const store = readable({}, set => {
        function updateState(event) {
            const { url, initial } = event.detail;
            const state = computeState(url);
            set({ url, initial, state });
        }
        window.addEventListener("app-url-change", updateState);
        return () => window.removeEventListener("app-url-change", updateState)
    });

    import Render from './lib/render.svelte'
</script>

{#if $store.state}
    <Render url={$store.url} initial={$store.initial} state={$store.state} />
{/if}
