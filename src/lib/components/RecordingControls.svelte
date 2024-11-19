<script lang="ts">
	import fixWebmDuration from 'fix-webm-duration';

	let { highResCanvas, recordingComplete } = $props<{
		highResCanvas: HTMLCanvasElement;
		recordingComplete: (blob: Blob) => void;
	}>();

	let isRecording = $state(false);
	let audioStream = $state<MediaStream | null>(null);
	let mediaRecorder: MediaRecorder | null = $state(null);
	let recordedChunks = $state<Blob[]>([]);
	let recordingStartTime = $state<number>(0);
	let withAudio = $state(false);

	async function startRecording(withAudio: boolean = true) {
		if (highResCanvas) {
			recordedChunks = [];
			const canvasStream = highResCanvas.captureStream(60); // 60 FPS
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
				const blob = new Blob(recordedChunks, { type: 'video/webm' });
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

<div class="controls-container">
	<button
		class="mic-button"
		title={withAudio ? 'Audio recording ON' : 'Audio recording OFF'}
		onclick={() => (withAudio = !withAudio)}
	>
		<span class="mic-emoji">🎙️</span>
		{#if !withAudio}
			<span class="x-overlay">❌</span>
		{/if}
	</button>
	<button class="record-button" onclick={toggleRecording}>
		<span class="recording-dot" class:recording={isRecording}></span>
		{isRecording ? 'Stop' : 'Start'}
	</button>
</div>

<style>
	.controls-container {
		position: absolute;
		bottom: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	button:hover {
		background: #f1ecec;
	}

	.mic-button,
	.record-button {
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-weight: 500;
		display: flex;
		align-items: center;
		height: 40px;
	}

	.mic-button {
		position: relative;
		padding: 13px;
	}

	.mic-emoji {
		font-size: 1.2em;
	}

	.x-overlay {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.record-button {
		min-width: 100px;
		text-align: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
	}

	.recording-dot {
		width: 10px;
		height: 10px;
		background-color: red;
		border-radius: 50%;
	}

	.recording-dot.recording {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 1;
		}
	}
</style>
