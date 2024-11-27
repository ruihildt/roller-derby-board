<script lang="ts">
	import { Toolbar, ToolbarButton } from 'flowbite-svelte';
	import fixWebmDuration from 'fix-webm-duration';
	import { MicrophoneOutline, MicrophoneSlashOutline } from 'flowbite-svelte-icons';

	let {
		recordingComplete,
		highResCanvas,
		isRecording = $bindable(),
		countdown = $bindable()
	} = $props<{
		recordingComplete: (blob: Blob) => void;
		highResCanvas: HTMLCanvasElement;
		isRecording: boolean;
		countdown: number | null;
	}>();

	let audioStream = $state<MediaStream | null>(null);
	let mediaRecorder: MediaRecorder | null = $state(null);
	let recordedChunks = $state<Blob[]>([]);
	let recordingStartTime = $state<number>(0);
	let withAudio = $state(false);

	async function startRecording(withAudio: boolean = true) {
		countdown = 3;
		const countdownInterval = setInterval(() => {
			countdown = countdown! - 1;
		}, 1000);

		await new Promise((resolve) => setTimeout(resolve, 3000));
		clearInterval(countdownInterval);
		countdown = null;

		if (highResCanvas) {
			recordedChunks = [];
			const canvasStream = highResCanvas.captureStream(30); // 30 FPS
			let combinedStream;

			if (withAudio) {
				try {
					audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
					combinedStream = new MediaStream([
						...canvasStream.getVideoTracks(),
						...audioStream.getAudioTracks()
					]);
				} catch (err) {
					console.error('Error accessing the microphone', err);
					return;
				}
			} else {
				combinedStream = canvasStream;
			}

			mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunks = [...recordedChunks, event.data];
				}
			};

			mediaRecorder.onstop = async () => {
				const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp8,opus' });
				const duration = Date.now() - recordingStartTime;
				const fixedBlob = await fixWebmDuration(blob, duration);

				recordingComplete(fixedBlob);

				if (audioStream) {
					audioStream.getTracks().forEach((track) => track.stop());
				}
			};

			recordingStartTime = Date.now();
			mediaRecorder.start();
			isRecording = true;
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;

			if (audioStream) {
				audioStream.getTracks().forEach((track) => track.stop());
			}
		}
	}

	async function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			try {
				await startRecording(withAudio);
			} catch (error) {
				console.error('Failed to start recording:', error);
			}
		}
	}
</script>

<Toolbar
	class="fixed left-1/2 top-4 inline-flex -translate-x-1/2 rounded-lg border bg-white shadow-lg"
>
	<ToolbarButton class="relative" on:click={() => (withAudio = !withAudio)}>
		{#if withAudio}
			<MicrophoneOutline />
		{:else}
			<MicrophoneSlashOutline />
		{/if}
	</ToolbarButton>

	<ToolbarButton class="flex items-center gap-2" on:click={toggleRecording}>
		<span class={`h-2.5 w-2.5 rounded-full bg-red-600 ${isRecording ? 'animate-pulse' : ''}`}
		></span>
		{isRecording ? 'Stop recording' : 'Start recording'}
	</ToolbarButton>
</Toolbar>
