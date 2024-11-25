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
		const { width, height } = calculateCanvasSize(container.clientWidth, container.clientHeight);
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

<div bind:this={container}>
	<canvas bind:this={canvas}></canvas>
	<canvas bind:this={highResCanvas} style="display: none;"></canvas>
	<ControlBar {highResCanvas} recordingComplete={handleRecordingComplete} />
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
