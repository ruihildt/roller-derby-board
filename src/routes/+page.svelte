<script lang="ts">
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';

	let showPreview = $state(false);
	let recordedBlob: Blob | null = $state(null);

	function handleRecordingComplete(blob: Blob) {
		recordedBlob = blob;
		showPreview = true;
	}

	function handlePreviewClose() {
		showPreview = false;
		recordedBlob = null;
	}
</script>

<main>
	<div class="centering-container">
		<BoardCanvas recordingComplete={handleRecordingComplete} />
	</div>
	{#if showPreview && recordedBlob}
		<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		height: 100vh;
		display: grid;
	}

	main {
		display: grid;
		place-items: center;
	}
	.centering-container {
		aspect-ratio: 59.8/42;
		width: 100%;
		max-width: 1200px;
		max-height: 100vh;
	}
</style>
