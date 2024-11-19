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
		a.download = `derby-strategy-${new Date().toISOString()}.webm`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		close();
	}

	function handleDiscard() {
		close();
	}
</script>

<div class="modal">
	<div class="modal-content">
		<video controls src={videoUrl}>
			<track kind="captions" src="" label="English" srclang="en" />
		</video>
		<div class="actions">
			<button onclick={handleDownload}>💾 Download</button>
			<button onclick={handleDiscard} class="discard">🗑️ Discard</button>
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
		background: white;
		max-width: 90%;
		max-height: 90%;
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

	video {
		max-width: 100%;
		max-height: 70vh;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		padding: 3px 5px;
	}
</style>
