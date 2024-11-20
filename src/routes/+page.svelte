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
	<BoardCanvas recordingComplete={handleRecordingComplete} />

	{#if showPreview && recordedBlob}
		<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
	{/if}
</main>

<style>
	main {
		aspect-ratio: 3/2;
		max-width: 1000px;
		width: 100%;
		max-height: 100vh;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
