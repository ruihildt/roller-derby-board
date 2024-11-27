<script lang="ts">
	import { Badge, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { StopSolid } from 'flowbite-svelte-icons';
	import {
		MicrophoneOutline,
		MicrophoneSlashOutline,
		ArrowsRepeatOutline,
		DownloadOutline
	} from 'flowbite-svelte-icons';
	import fixWebmDuration from 'fix-webm-duration';

	let {
		recordingComplete,
		highResCanvas,
		isDarkBackground = $bindable(),
		isRecording = $bindable(),
		videoBlob = $bindable(),
		onDiscard = $bindable()
	} = $props<{
		recordingComplete: (blob: Blob) => void;
		highResCanvas: HTMLCanvasElement;
		isDarkBackground: boolean;
		isRecording: boolean;
		videoBlob?: Blob | null;
		onDiscard?: () => void;
	}>();

	let audioStream = $state<MediaStream | null>(null);
	let mediaRecorder: MediaRecorder | null = $state(null);
	let recordedChunks = $state<Blob[]>([]);
	let recordingStartTime = $state<number>(0);
	let withAudio = $state(false);
	let countdown = $state<number | null>(null);
	let elapsedTime = $state(0);
	let timeInterval = $state<number | null>(null);

	async function startRecording(withAudio: boolean = true) {
		isDarkBackground = true;
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
			timeInterval = setInterval(() => {
				elapsedTime = Date.now() - recordingStartTime;
			}, 1000);
			mediaRecorder.start();
			isRecording = true;
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			if (timeInterval) {
				clearInterval(timeInterval);
				timeInterval = null;
			}
			elapsedTime = 0;

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

	function handleDownload() {
		if (!videoBlob) return;

		const url = URL.createObjectURL(videoBlob);
		const a = document.createElement('a');
		a.href = url;

		const now = new Date();
		const year = now.getFullYear().toString().slice(-2);
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');

		a.download = `rollerderby.click-${year}-${month}-${day}.webm`;

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		onDiscard();
	}
</script>

<Toolbar
	class="fixed left-1/2 top-4 z-[11] inline-flex -translate-x-1/2 rounded-lg !p-1 shadow-lg shadow-black/5"
>
	{#if !videoBlob}
		<ToolbarButton
			class={isRecording || countdown !== null
				? 'cursor-not-allowed opacity-50'
				: 'hover:bg-primary-200'}
			on:click={() => (withAudio = !withAudio)}
			disabled={isRecording || countdown !== null}
		>
			{#if withAudio}
				<MicrophoneOutline />
			{:else}
				<MicrophoneSlashOutline />
			{/if}
		</ToolbarButton>

		<ToolbarButton
			class="flex items-center gap-2 px-3 {countdown !== null
				? 'cursor-not-allowed opacity-50'
				: 'hover:bg-primary-200'}"
			on:click={toggleRecording}
			disabled={countdown !== null}
		>
			{#if isRecording}
				<StopSolid class="text-red-600" />
			{:else}
				<span class="h-2.5 w-2.5 rounded-full bg-red-600"></span>
			{/if}
			{isRecording ? 'Stop' : countdown !== null ? `Starting in ${countdown}...` : 'Record'}
		</ToolbarButton>

		{#if isRecording}
			<div class="mx-2">
				{Math.floor(elapsedTime / 60000)}:{Math.floor((elapsedTime % 60000) / 1000)
					.toString()
					.padStart(2, '0')}
			</div>
		{/if}
	{:else}
		<ToolbarButton class="flex items-center gap-2 px-3 hover:bg-primary-200" on:click={onDiscard}>
			<ArrowsRepeatOutline />
			Restart
		</ToolbarButton>
		<ToolbarButton
			class="flex items-center gap-2 px-3 hover:bg-primary-200"
			on:click={handleDownload}
		>
			<DownloadOutline />
			Download
		</ToolbarButton>
	{/if}
</Toolbar>
