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
				const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp8,opus' });
				const duration = Date.now() - recordingStartTime;
				const fixedBlob = await fixWebmDuration(blob, duration);

				recordingComplete(fixedBlob);

				if (audioStream) {
					audioStream.getTracks().forEach((track) => track.stop());
				}
			};

			// IF playback of audio doesn't start reliably, we can try this
			//
			// mediaRecorder.onstop = async () => {
			// 	const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp8,opus' });
			// 	const duration = Date.now() - recordingStartTime;
			// 	const fixedBlob = await fixWebmDuration(blob, duration);

			// 	// Force metadata loading before passing the blob
			// 	const videoElement = document.createElement('video');
			// 	videoElement.preload = 'metadata';

			// 	const blobUrl = URL.createObjectURL(fixedBlob);
			// 	videoElement.src = blobUrl;

			// 	videoElement.onloadedmetadata = () => {
			// 		URL.revokeObjectURL(blobUrl);
			// 		recordingComplete(fixedBlob);
			// 	};

			// 	if (audioStream) {
			// 		audioStream.getTracks().forEach((track) => track.stop());
			// 	}
			// };

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

<div class="flex items-center gap-2.5">
	<button
		class="relative flex items-center bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
		title={withAudio ? 'Audio recording ON' : 'Audio recording OFF'}
		onclick={() => (withAudio = !withAudio)}
	>
		<span class="text-lg">🎙️</span>
		{#if !withAudio}
			<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">❌</span>
		{/if}
	</button>
	<button
		class="flex items-center justify-center gap-2 min-w-[100px] bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-100 font-medium"
		onclick={toggleRecording}
	>
		<span class={`w-2.5 h-2.5 rounded-full bg-red-600 ${isRecording ? 'animate-pulse' : ''}`}
		></span>
		{isRecording ? 'Stop' : 'Start'}
	</button>
</div>
