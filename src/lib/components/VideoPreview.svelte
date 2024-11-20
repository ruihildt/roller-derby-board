<script lang="ts">
	let { videoBlob, close } = $props<{
		videoBlob: Blob;
		close: () => void;
	}>();

	let videoUrl = URL.createObjectURL(videoBlob);

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
		// Close the modal only if the backdrop is clicked
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
<div class="modal" onclick={handleBackdropClick}>
	<div class="modal-content">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video controls src={videoUrl} preload="auto" playsinline></video>
		<div class="actions">
			<button onclick={handleDiscard} class="discard">🗑️ Discard</button>
			<button onclick={handleDownload}>💾 Download</button>
		</div>
	</div>
</div>

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: #f0f0f0;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 1fr 50px;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		padding: 3px 5px;
	}

	button {
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-weight: 500;
		height: 40px;
		min-width: 100px;
		text-align: center;
		padding: 10px 20px;
		margin: 3px;
	}

	button:hover {
		background: #f1ecec;
	}

	.discard:hover {
		background: #d64545;
		color: white;
	}
</style>
