<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/classes/Game';
	import { calculateCanvasSize } from '$lib/utils/utils';

	let { recordingComplete, highResCanvas = $bindable() } = $props<{
		recordingComplete: (blob: Blob) => void;
		highResCanvas: HTMLCanvasElement;
	}>();

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let game: Game;

	function handleResize() {
		if (!container) return;

		const availableHeight = container.clientHeight;
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
</script>

<div bind:this={container} class="grid h-full w-full place-items-center">
	<canvas bind:this={canvas} class="dashed grey border border-2"></canvas>
	<canvas bind:this={highResCanvas} class="hidden"></canvas>
</div>
