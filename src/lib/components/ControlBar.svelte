<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import RecordingControls from '$lib/components/RecordingControls.svelte';

	export let highResCanvas: HTMLCanvasElement;
	export let recordingComplete: (blob: Blob) => void;
</script>

<div class="control-bar">
	<AboutPage />
	<RecordingControls {highResCanvas} {recordingComplete} />
</div>

<style>
	.control-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: rebeccapurple;
		height: 40px;
	}
</style>
