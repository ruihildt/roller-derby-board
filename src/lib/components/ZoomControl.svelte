<script lang="ts">
	import { Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { ScalingManager } from '$lib/classes/ScalingManager';
	import { MinusOutline, PlusOutline } from 'flowbite-svelte-icons';

	function zoomIn() {
		ScalingManager.getInstance().zoomIn();
	}

	function zoomOut() {
		ScalingManager.getInstance().zoomOut();
	}

	function resetZoom() {
		ScalingManager.getInstance().resetZoom();
	}
</script>

<Toolbar class="inline-flex rounded-lg !p-1 shadow-lg shadow-black/5">
	<ToolbarButton
		class="flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200"
		on:click={zoomOut}
	>
		<MinusOutline />
	</ToolbarButton>
	<ToolbarButton
		class="flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200"
		on:click={resetZoom}
	>
		reset
	</ToolbarButton>
	<ToolbarButton
		class="flex items-center gap-2 px-3 text-sm text-gray-700 hover:bg-primary-200"
		on:click={zoomIn}
	>
		<PlusOutline />
	</ToolbarButton>
</Toolbar>
