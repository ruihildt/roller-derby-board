<script lang="ts">
	let { videoBlob = $bindable(), close } = $props<{
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

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
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
	</div>
</div>
