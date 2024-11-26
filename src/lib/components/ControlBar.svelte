<script lang="ts">
	import AboutPage from '$lib/components/AboutPage.svelte';
	import RecordingControls from '$lib/components/RecordingControls.svelte';

	export let highResCanvas: HTMLCanvasElement;
	export let recordingComplete: (blob: Blob) => void;
</script>

<div class="control-bar">
	<RecordingControls {highResCanvas} {recordingComplete} />
</div>

<style>
	.control-bar {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 40px;
	}
</style>
