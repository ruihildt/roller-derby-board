<script lang="ts">
	import { buildDate, version } from '../utils/appVersion';
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
			<div class="title-container">
				<h1>🛼 Roller Derby Strategy Board</h1>
				<span class="version-badge">{version} | {buildDate}</span>
			</div>
			<p>
				An interactive web application for real-time recording of roller derby strategies through
				your browser.
			</p>

			<p>
				More information about the project and code can be found on <a
					href="https://github.com/ruihildt/roller-derby-strategy"
					target="_blank">Github</a
				>. The whole project is licensed under (<a
					href="https://www.gnu.org/licenses/agpl-3.0.en.html"
					target="_blank"
				>
					AGPLv3</a
				>).
			</p>

			<hr class="separator" />

			<p>
				For feedback or suggestions, please <a
					href="https://github.com/ruihildt/roller-derby-strategy/issues"
					target="_blank">open an issue</a
				>
				or <a href="mailto:ruihildt@protonmail.com">email me</a>.
			</p>
		</div>
	</div>
{/if}

<button class="about-button" on:click={() => (showAbout = true)}> ℹ️ About </button>

<style>
	button:hover {
		background: #f1ecec;
	}
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
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
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

	.version-badge {
		bottom: 10px;
		right: 10px;
		background: #e9ecef;
		color: #495057;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.9rem;
		font-weight: 500;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.separator {
		border: 0;
		height: 1px;
		background-color: #e9ecef;
		margin: 1.5rem 0;
	}
</style>
