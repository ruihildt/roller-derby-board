<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let showPreview = $state(false);
	let recordedBlob: Blob | null = $state(null);
	let highResCanvas = $state<HTMLCanvasElement>()!;
	let isRecording = $state(false);
	let countdown = $state<number | null>(null);

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
	{#if countdown}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
			<span class="text-9xl font-bold text-red-600">{countdown}</span>
		</div>
	{/if}
	<div class="mx-auto aspect-[100/67] max-h-screen w-full max-w-[1200px]">
		<BoardCanvas bind:highResCanvas recordingComplete={handleRecordingComplete} />
	</div>
</main>

{#if showPreview && recordedBlob}
	<VideoPreview videoBlob={recordedBlob} close={handlePreviewClose} />
{/if}

<Toolbar
	bind:isRecording
	bind:countdown
	{highResCanvas}
	recordingComplete={handleRecordingComplete}
/>
<AboutPage />
