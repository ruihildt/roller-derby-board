<script lang="ts">
	let showAbout: boolean;
</script>

{#if showAbout}
	<div class="about-overlay">
		<div class="about-content">
			<button
				class="close-button"
				on:click={() => {
					showAbout = false;
				}}>×</button
			>
			<h1>About Roller Derby Strategy Board</h1>
			<p>
				An interactive web application for real-time recording of roller derby strategies through
				your browser.
			</p>

			<p>
				For feedback or suggestions, please <a
					href="https://github.com/ruihildt/roller-derby-strategy/issues"
					target="_blank">open an issue on GitHub</a
				>
				or <a href="mailto:ruihildt@protonmail.com">email me</a>.
			</p>
		</div>
	</div>
{/if}

<button class="about-button" on:click={() => (showAbout = true)}> ℹ️ About </button>

<style>
	.about-button {
		position: absolute;
		bottom: 20px;
		left: 20px;
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
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
	}

	.about-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.about-content {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		width: 90%;
		max-width: 600px;
		max-height: 80%;
		overflow-y: auto;
		position: relative;
	}

	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		border: none;
		background: none;
		font-size: 24px;
		cursor: pointer;
	}
</style>
