<!-- src/routes/+page.svelte -->
<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let showPreview = $state(false);
	let recordedBlob: Blob | null = $state(null);
	let highResCanvas = $state<HTMLCanvasElement>()!;
	let isRecording = $state(false); // Add this line

	function handleRecordingComplete(blob: Blob) {
		recordedBlob = blob;
		showPreview = true;
	}

	function handlePreviewClose() {
		showPreview = false;
		recordedBlob = null;
	}
</script>

<main
	class={`bg-b flex min-h-screen items-center justify-center ${isRecording ? 'bg-black' : 'bg-[#f0f0f0]'}`}
>
	<div class="mx-auto aspect-[100/67] max-h-screen w-full max-w-[1200px]">
		<BoardCanvas bind:highResCanvas recordingComplete={handleRecordingComplete} />
	</div>
</main>

{#if showPreview && recordedBlob}
	<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
{/if}

<Toolbar bind:isRecording {highResCanvas} recordingComplete={handleRecordingComplete} />
<AboutPage />
