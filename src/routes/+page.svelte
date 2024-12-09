<script lang="ts">
	import { onMount } from 'svelte';
	import { KonvaGame } from '$lib/konva/KonvaGame';

	let game = $state<KonvaGame>()!;

	onMount(() => {
		game = new KonvaGame('container', window.innerWidth, window.innerHeight);
	});

	import Menu from '$lib/components/Menu.svelte';
	import ZoomControl from '$lib/components/ZoomControl.svelte';
	import Changelog from '$lib/components/Changelog.svelte';
	import FullscreenButton from '$lib/components/FullscreenButton.svelte';

	// import Board from '$lib/components/Board.svelte';
	// import Video from '$lib/components/Video.svelte';
	// import Record from '$lib/components/Record.svelte';
	// import type { Game } from '$lib/classes/Game';
	// import PanModeButton from '$lib/components/PanModeButton.svelte';

	// let showPreview = $state(false);
	// let recordedBlob = $state<Blob | null>(null);
	// let highResCanvas = $state<HTMLCanvasElement>()!;
	// let game = $state<Game>()!;
	// let isRecording = $state(false);
	// let isDarkBackground = $state(false);

	// function handleRecordingComplete(blob: Blob) {
	// 	recordedBlob = blob;
	// 	showPreview = true;
	// }

	// function handlePreviewClose() {
	// 	showPreview = false;
	// 	recordedBlob = null;
	// 	isDarkBackground = false;
	// }
</script>

<main class="h-screen w-screen">
	<div id="container" class="absolute left-0 top-0 h-screen w-screen"></div>
</main>

<Menu {game} />

<div class="fixed bottom-4 left-4 flex gap-2">
	<ZoomControl {game} />
	<!-- <PanModeButton /> -->
</div>

<div class="fixed bottom-4 right-4 flex gap-2">
	<Changelog />
	<FullscreenButton />
</div>

<!-- <main class="h-screen w-screen">
	<Board bind:highResCanvas bind:game />
	{#if showPreview && recordedBlob}
		<Video bind:videoBlob={recordedBlob} close={handlePreviewClose} />
	{/if}
</main>

<Record
	bind:isRecording
	bind:videoBlob={recordedBlob}
	bind:isDarkBackground
	{highResCanvas}
	recordingComplete={handleRecordingComplete}
	onDiscard={handlePreviewClose}
/>
{#if !isDarkBackground}
	<Menu {game} />

	<div class="fixed bottom-4 left-4 flex gap-2">
		<ZoomControl />
		<PanModeButton />
	</div>

	<div class="fixed bottom-4 right-4 flex gap-2">
		<Changelog />
		<FullscreenButton />
	</div>
{/if} -->
