<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ExpandOutline, MinimizeOutline } from 'flowbite-svelte-icons';

	let isFullscreen = $state(false);

	async function toggleFullscreen() {
		if (!document.fullscreenElement) {
			await document.documentElement.requestFullscreen();
			isFullscreen = true;
		} else {
			await document.exitFullscreen();
			isFullscreen = false;
		}
	}
</script>

<Button class="bg-white !p-2 hover:bg-primary-200" onclick={toggleFullscreen}>
	{#if isFullscreen}
		<MinimizeOutline class="h-6 w-6" color="gray" />
	{:else}
		<ExpandOutline class="h-6 w-6" color="gray" />
	{/if}
</Button>
