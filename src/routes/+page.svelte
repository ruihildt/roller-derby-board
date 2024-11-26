<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
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

<main class="min-h-screen bg-gray-100">
	<div class="container mx-auto px-4 py-8">
		<div class="aspect-[59.8/42] w-full max-w-[1200px] max-h-screen mx-auto">
			<BoardCanvas recordingComplete={handleRecordingComplete} />
		</div>
		{#if showPreview && recordedBlob}
			<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
		{/if}
		<AboutPage />
	</div>
</main>
