<script lang="ts">
	import { onMount } from 'svelte';

	import { Game } from '$lib/Game';
	import RecordingControls from '$lib/RecordingControls.svelte';
	import { calculateCanvasSize } from '$lib/utils';

	let canvas: HTMLCanvasElement;
	let game: Game;

	let highResCanvas: HTMLCanvasElement;
	let isRecording = false;

	$: if (game && isRecording !== undefined) {
		game.isRecording = isRecording;
	}

	onMount(() => {
		if (canvas) {
			const resizeCanvas = () => {
				const container = canvas.parentElement;
				if (container) {
					const { width, height } = calculateCanvasSize(
						container.clientWidth,
						container.clientHeight
					);
					canvas.width = width;
					canvas.height = height;
					game = new Game(canvas, highResCanvas, isRecording);
					game.gameLoop();
				}
			};

			window.addEventListener('resize', resizeCanvas);
			resizeCanvas();

			return () => {
				window.removeEventListener('resize', resizeCanvas);
				if (game) {
					game.cleanup();
				}
			};
		}
	});
</script>

<div class="canvas-container">
	<canvas bind:this={canvas}></canvas>
	<canvas bind:this={highResCanvas} style="display: none;"></canvas>
	<RecordingControls bind:highResCanvas bind:isRecording />
</div>

<style>
	.canvas-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	canvas {
		max-width: 100%;
		max-height: 100%;
	}
</style>
