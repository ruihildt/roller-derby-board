<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let showPreview = $state(false);
	let recordedBlob = $state<Blob | null>(null);
	let highResCanvas = $state<HTMLCanvasElement>()!;
	let isRecording = $state(false);
	let countdown = $state<number | null>(null);
	let isDarkBackground = $state(false);

	function handleRecordingComplete(blob: Blob) {
		recordedBlob = blob;
		showPreview = true;
	}

	function handlePreviewClose() {
		showPreview = false;
		recordedBlob = null;
		isDarkBackground = false;
	}
</script>

<main
	class={`bg-b flex min-h-screen items-center justify-center transition-colors duration-300 ${
		isDarkBackground ? 'bg-black' : 'bg-[#f0f0f0]'
	}`}
>
	<div class="relative mx-auto aspect-[100/67] max-h-screen w-full max-w-[1200px]">
		<BoardCanvas bind:highResCanvas recordingComplete={handleRecordingComplete} />
		{#if countdown}
			<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
				<span class="text-9xl font-bold text-red-600">{countdown}</span>
			</div>
		{/if}
		{#if showPreview && recordedBlob}
			<VideoPreview bind:videoBlob={recordedBlob} close={handlePreviewClose} />
		{/if}
	</div>
</main>

<Toolbar
	bind:isRecording
	bind:countdown
	bind:videoBlob={recordedBlob}
	bind:isDarkBackground
	{highResCanvas}
	recordingComplete={handleRecordingComplete}
	onDiscard={handlePreviewClose}
/>
<AboutPage />
