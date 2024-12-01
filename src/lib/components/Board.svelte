<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/classes/Game';
	import { calculateCanvasSize } from '$lib/utils/utils';
	import { panMode } from '$lib/stores/panMode';
	import { saveBoardState } from '$lib/utils/boardStateService';

	let { highResCanvas = $bindable(), game = $bindable() } = $props<{
		highResCanvas: HTMLCanvasElement;
		game: Game;
	}>();

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let isDragging = false;
	let lastX = 0;
	let lastY = 0;

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

	function handleMouseDown(e: MouseEvent) {
		if ($panMode) {
			isDragging = true;
			lastX = e.clientX;
			lastY = e.clientY;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if ($panMode && isDragging) {
			const deltaX = e.clientX - lastX;
			const deltaY = e.clientY - lastY;
			game.scalingManager.setPan(-deltaX, -deltaY);
			lastX = e.clientX;
			lastY = e.clientY;
		}
	}

	function handleMouseUp() {
		isDragging = false;
		saveBoardState(game);
	}

	function handleTouchStart(e: TouchEvent) {
		if ($panMode) {
			isDragging = true;
			lastX = e.touches[0].clientX;
			lastY = e.touches[0].clientY;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if ($panMode && isDragging) {
			const deltaX = e.touches[0].clientX - lastX;
			const deltaY = e.touches[0].clientY - lastY;
			game.scalingManager.setPan(-deltaX, -deltaY);
			lastX = e.touches[0].clientX;
			lastY = e.touches[0].clientY;
		}
	}

	function handleTouchEnd() {
		isDragging = false;
		saveBoardState(game);
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
	<canvas
		bind:this={canvas}
		class="dashed grey border border-2"
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		ontouchcancel={handleTouchEnd}
	></canvas>
	<canvas bind:this={highResCanvas} class="hidden"></canvas>
</div>
