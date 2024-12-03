<script lang="ts">
	import { Toolbar, ToolbarButton, Tooltip } from 'flowbite-svelte';
	import { MinusOutline, PlusOutline } from 'flowbite-svelte-icons';
	import { viewport } from '$lib/stores/viewport';
	import { BASE_ZOOM, MAX_ZOOM, MIN_ZOOM, ZOOM_INCREMENT } from '$lib/constants';

	let zoomLevel = 100;

	function updateZoomDisplay() {
		zoomLevel = Math.round($viewport.zoom * 100);
	}

	function zoomIn() {
		viewport.update((state) => {
			const newZoom = Math.min(state.zoom + ZOOM_INCREMENT, MAX_ZOOM);
			return { ...state, zoom: newZoom };
		});
	}

	function zoomOut() {
		viewport.update((state) => {
			const newZoom = Math.max(state.zoom - ZOOM_INCREMENT, MIN_ZOOM);
			return { ...state, zoom: newZoom };
		});
	}

	function resetZoom() {
		viewport.set({
			zoom: BASE_ZOOM,
			panX: 0,
			panY: 0
		});
	}

	$: {
		updateZoomDisplay();
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
