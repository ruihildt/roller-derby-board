<script>
	import BoardCanvas from '$lib/components/BoardCanvas.svelte';
</script>

<main>
	<BoardCanvas />
</main>

<style>
	main {
		aspect-ratio: 3/2;
		max-width: 1000px;
		width: 100%;
		max-height: 100vh;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
