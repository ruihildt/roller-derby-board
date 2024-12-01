<script lang="ts">
	import { panMode } from '$lib/stores/panMode';
	import { Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { LockOutline, LockOpenOutline } from 'flowbite-svelte-icons';
</script>

<Toolbar class="inline-flex rounded-lg !p-1 shadow-lg shadow-black/5">
	<ToolbarButton
		class="flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200"
		on:click={() => panMode.set(!$panMode)}
	>
		{#if $panMode}
			<LockOpenOutline />
		{:else}
			<LockOutline />
		{/if}
		Drag board
	</ToolbarButton>
</Toolbar>
