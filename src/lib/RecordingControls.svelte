<script lang="ts">
	import fixWebmDuration from 'fix-webm-duration';

	export let highResCanvas: HTMLCanvasElement;
	export let isRecording = false;
	export let audioStream: MediaStream | null = null;

	let mediaRecorder: MediaRecorder | null = null;
	let recordedChunks: Blob[] = [];
	let recordingStartTime: number;

	async function startRecording() {
		if (highResCanvas) {
			recordedChunks = [];

			try {
				audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch (err) {
				console.error('Error accessing the microphone', err);
				return;
			}

			const canvasStream = highResCanvas.captureStream(60); // 60 FPS

			const combinedStream = new MediaStream([
				...canvasStream.getVideoTracks(),
				...audioStream.getAudioTracks()
			]);

			mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const blob = new Blob(recordedChunks, { type: 'video/webm' });
				const duration = Date.now() - recordingStartTime;
				const fixedBlob = await fixWebmDuration(blob, duration);

				const url = URL.createObjectURL(fixedBlob);
				const a = document.createElement('a');
				document.body.appendChild(a);
				a.style.display = 'none';
				a.href = url;
				a.download = 'roller-derby-simulation.webm';
				a.click();
				window.URL.revokeObjectURL(url);

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
				await startRecording();
			} catch (error) {
				console.error('Failed to start recording:', error);
			}
		}
	}
</script>

<button on:click={toggleRecording}>
	{isRecording ? 'Stop Recording' : 'Start Recording'}
</button>

<style>
	button {
		margin-top: 10px;
	}
</style>
