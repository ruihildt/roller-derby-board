<script lang="ts">
	import { buildDate, version } from '../utils/appVersion';
	let showAbout: boolean;
</script>

{#if showAbout}
	<div class="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000]">
		<div
			class="bg-white p-8 rounded-lg w-[90%] max-w-[600px] max-h-[80%] overflow-y-auto relative font-sans"
		>
			<button
				class="absolute top-2.5 right-2.5 border-none bg-transparent text-2xl cursor-pointer hover:text-primary-600"
				on:click={() => {
					showAbout = false;
				}}>×</button
			>
			<div class="flex items-center gap-4 mb-4">
				<h1 class="text-2xl m-0">🛼 Roller Derby Strategy Board</h1>
				<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-xl text-sm font-medium"
					>{version} | {buildDate}</span
				>
			</div>
			<p class="mb-4">
				An interactive web application for real-time recording of roller derby strategies through
				your browser.
			</p>

			<p class="mb-4">
				More information about the project and code can be found on <a
					href="https://github.com/ruihildt/roller-derby-strategy"
					class="text-primary-600 hover:text-primary-700"
					target="_blank">Github</a
				>. The whole project is licensed under (<a
					href="https://www.gnu.org/licenses/agpl-3.0.en.html"
					class="text-primary-600 hover:text-primary-700"
					target="_blank"
				>
					AGPLv3</a
				>).
			</p>

			<hr class="border-0 h-px bg-gray-100 my-6" />

			<p>
				For feedback or suggestions, please <a
					href="https://github.com/ruihildt/roller-derby-strategy/issues"
					class="text-primary-600 hover:text-primary-700"
					target="_blank">open an issue</a
				>
				or
				<a href="mailto:ruihildt@protonmail.com" class="text-primary-600 hover:text-primary-700"
					>email me</a
				>.
			</p>
		</div>
	</div>
{/if}

<button
	class="absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full cursor-pointer shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
	on:click={() => (showAbout = true)}
>
	<span class="text-2xl">ℹ️</span>
</button>
