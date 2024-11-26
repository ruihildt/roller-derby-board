<script lang="ts">
	import RecordingControls from '$lib/components/RecordingControls.svelte';

	export let highResCanvas: HTMLCanvasElement;
	export let recordingComplete: (blob: Blob) => void;
</script>

<div class="w-full flex justify-between items-center h-10">
	<RecordingControls {highResCanvas} {recordingComplete} />
</div>
