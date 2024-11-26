<script lang="ts">
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
	class="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000]"
	onclick={handleBackdropClick}
>
	<div class="bg-gray-100 w-full h-full grid grid-rows-[1fr_50px]">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			controls={true}
			src={videoUrl}
			preload="auto"
			playsinline
			class="w-full h-full object-contain"
		></video>
		<div class="flex justify-end p-[3px_5px]">
			<button
				onclick={handleDiscard}
				class="bg-white border border-gray-300 rounded cursor-pointer font-system font-medium h-10 min-w-[100px] text-center px-5 py-2.5 m-[3px] hover:bg-gray-100 hover:bg-red-600 hover:text-white"
			>
				🗑️ Discard
			</button>
			<button
				onclick={handleDownload}
				class="bg-white border border-gray-300 rounded cursor-pointer font-system font-medium h-10 min-w-[100px] text-center px-5 py-2.5 m-[3px] hover:bg-gray-100"
			>
				💾 Download
			</button>
		</div>
	</div>
</div>
