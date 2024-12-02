<script lang="ts">
	import { Toolbar, ToolbarButton, Tooltip } from 'flowbite-svelte';
	import { ScalingManager } from '$lib/classes/ScalingManager';
	import { MinusOutline, PlusOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let zoomLevel = 100;

	function updateZoomDisplay() {
		zoomLevel = Math.round(ScalingManager.getInstance().zoomLevel * 100);
	}

	function zoomIn() {
		ScalingManager.getInstance().zoomIn();
		updateZoomDisplay();
	}

	function zoomOut() {
		ScalingManager.getInstance().zoomOut();
		updateZoomDisplay();
	}

	function resetZoom() {
		ScalingManager.getInstance().resetZoom();
		updateZoomDisplay();
	}

	onMount(() => {
		window.addEventListener('scalingUpdate', updateZoomDisplay);
		updateZoomDisplay();
		return () => window.removeEventListener('scalingUpdate', updateZoomDisplay);
	});
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
