<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Video from '$lib/components/Video.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import type { Game } from '$lib/classes/Game';
	import Changelog from '$lib/components/Changelog.svelte';
	import FullscreenButton from '$lib/components/FullscreenButton.svelte';
	import ZoomControl from '$lib/components/ZoomControl.svelte';
	import PanModeButton from '$lib/components/PanModeButton.svelte';

	let showPreview = $state(false);
	let recordedBlob = $state<Blob | null>(null);
	let highResCanvas = $state<HTMLCanvasElement>()!;
	let game = $state<Game>()!;
	let isRecording = $state(false);
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
		<Board bind:highResCanvas bind:game />
		{#if showPreview && recordedBlob}
			<Video bind:videoBlob={recordedBlob} close={handlePreviewClose} />
		{/if}
	</div>
</main>

<Toolbar
	bind:isRecording
	bind:videoBlob={recordedBlob}
	bind:isDarkBackground
	{highResCanvas}
	recordingComplete={handleRecordingComplete}
	onDiscard={handlePreviewClose}
/>
{#if !isDarkBackground}
	<Menu {game} />
	<Changelog />
	<div class="absolute bottom-4 left-4 flex gap-2">
		<FullscreenButton />
		<ZoomControl />
		<PanModeButton />
	</div>
{/if}
