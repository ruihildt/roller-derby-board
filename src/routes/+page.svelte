<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let showPreview = $state(false);
	let recordedBlob: Blob | null = $state(null);
	let highResCanvas = $state<HTMLCanvasElement>()!;

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
		<div class="mx-auto aspect-[59.8/42] max-h-screen w-full max-w-[1200px]">
			<BoardCanvas bind:highResCanvas recordingComplete={handleRecordingComplete} />
		</div>
		{#if showPreview && recordedBlob}
			<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
		{/if}
	</div>
	<Toolbar {highResCanvas} recordingComplete={handleRecordingComplete} />
	<AboutPage />
</main>
