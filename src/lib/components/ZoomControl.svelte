<script lang="ts">
	import { Toolbar, ToolbarButton, Tooltip } from 'flowbite-svelte';
	import { MinusOutline, PlusOutline } from 'flowbite-svelte-icons';

	import type { KonvaGame } from '$lib/konva/KonvaGame';
	import { konvaViewport } from '$lib/stores/konvaViewport';

	let { game } = $props<{
		game: KonvaGame;
	}>();

	let zoomLevel = $derived(Math.round($konvaViewport.zoom * 100));

	function zoomIn() {
		game.zoomIn();
	}

	function zoomOut() {
		game.zoomOut();
	}

	function resetZoom() {
		game.resetZoom();
	}
</script>

<Toolbar class="inline-flex rounded-lg !p-1 shadow-lg shadow-black/5">
	<ToolbarButton
		class={zoomLevel <= 10
			? 'flex cursor-not-allowed items-center gap-2 px-3 text-sm text-gray-700 opacity-50'
			: 'flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200'}
		on:click={zoomOut}
		disabled={zoomLevel <= 10}
	>
		<MinusOutline />
	</ToolbarButton>
	<div class="relative">
		<ToolbarButton
			class="flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200"
			on:click={resetZoom}
		>
			{zoomLevel}%
		</ToolbarButton>
		<Tooltip trigger="hover" arrow={false} color="primary" class="hidden whitespace-nowrap md:block"
			>Reset zoom</Tooltip
		>
	</div>
	<ToolbarButton
		class={zoomLevel >= 300
			? 'flex cursor-not-allowed items-center gap-2 px-3 text-sm text-gray-700 opacity-50'
			: 'flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200'}
		on:click={zoomIn}
		disabled={zoomLevel >= 300}
	>
		<PlusOutline />
	</ToolbarButton>
</Toolbar>
