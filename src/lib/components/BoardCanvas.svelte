<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/classes/Game';
	import { calculateCanvasSize } from '$lib/utils/utils';
	import RecordingControls from '$lib/components/RecordingControls.svelte';
	import AboutPage from '$lib/components/AboutPage.svelte';

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let highResCanvas: HTMLCanvasElement;
	let game: Game;

	function handleResize() {
		const { width, height } = calculateCanvasSize(container.clientWidth, container.clientHeight);

		canvas.width = width;
		canvas.height = height;
		highResCanvas.width = width * 2;
		highResCanvas.height = height * 2;

		if (game) {
			game.resize();
		}
	}

	onMount(() => {
		handleResize();
		game = new Game(canvas, highResCanvas, false);
		game.gameLoop();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			game.cleanup();
		};
	});
</script>

<div bind:this={container} class="container">
	<canvas bind:this={canvas}></canvas>
	<canvas bind:this={highResCanvas} style="display: none;"></canvas>
	<AboutPage />
	<RecordingControls {highResCanvas} />
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
