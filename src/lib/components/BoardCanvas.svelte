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

	function handleRecordingComplete(blob: Blob) {
		recordingComplete(blob);
	}
</script>

<ControlBar {highResCanvas} recordingComplete={handleRecordingComplete} />
<div bind:this={container} class="flex flex-col items-center w-full h-full">
	<canvas bind:this={canvas} class="border border-solid border-[#cccccc]"></canvas>
	<canvas bind:this={highResCanvas} class="hidden"></canvas>
</div>
