<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/classes/Game';
	import { calculateCanvasSize } from '$lib/utils/utils';
	import ControlBar from '$lib/components/ControlBar.svelte';

	let { recordingComplete } = $props<{
		recordingComplete: (blob: Blob) => void;
	}>();

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let game: Game;

	let highResCanvas = $state<HTMLCanvasElement>()!;

	function handleResize() {
		if (!container) return;
		// Subtract control bar height
		const controlBarHeight = 40;
		const availableHeight = container.clientHeight - controlBarHeight;
		const { width, height } = calculateCanvasSize(container.clientWidth, availableHeight);

		canvas.width = width;
		canvas.height = height;
		highResCanvas.width = width * 2;
		highResCanvas.height = height * 2;
		game?.resize();
	}

	onMount(() => {
		requestAnimationFrame(() => {
			handleResize();
			game = new Game(canvas, highResCanvas, false);
			game.gameLoop();
		});

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			game?.cleanup();
		};
	});

	function handleRecordingComplete(blob: Blob) {
		recordingComplete(blob);
	}
</script>

<div bind:this={container} class="board-container">
	<canvas bind:this={canvas}></canvas>
	<canvas bind:this={highResCanvas} class="highResCanvas"></canvas>
	<ControlBar {highResCanvas} recordingComplete={handleRecordingComplete} />
</div>

<style>
	.board-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		background-color: #f0f0f0;
	}

	.highResCanvas {
		display: none;
	}
</style>
