<script lang="ts">
	import { Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { ArrowsRepeatOutline, DownloadOutline } from 'flowbite-svelte-icons';

	let { videoBlob, close } = $props<{
		videoBlob: Blob;
		close: () => void;
	}>();

	let videoUrl = URL.createObjectURL(videoBlob);
	let videoElement: HTMLVideoElement;

	$effect(() => {
		if (videoElement) {
			videoElement.load();
		}
	});

	function handleDownload() {
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
		close();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function handleDiscard() {
		close();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="absolute inset-0 z-[1000] flex items-center justify-center bg-black/70"
	onclick={handleBackdropClick}
>
	<div class="grey h-full w-full">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			controls={true}
			src={videoUrl}
			preload="auto"
			playsinline
			class="h-full w-full object-contain"
		></video>
		<Toolbar
			class="fixed bottom-4 left-1/2 inline-flex -translate-x-1/2 rounded-lg border bg-white shadow-lg"
		>
			<ToolbarButton class="flex items-center gap-2" onclick={handleDiscard}>
				<ArrowsRepeatOutline />
				Restart
			</ToolbarButton>
			<ToolbarButton class="flex items-center gap-2" onclick={handleDownload}>
				<DownloadOutline />
				Download
			</ToolbarButton>
		</Toolbar>
	</div>
</div>
