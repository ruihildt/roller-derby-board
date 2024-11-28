<script lang="ts">
	import { buildDate, version } from '../utils/appVersion';
	import { Modal, Badge, Hr, A } from 'flowbite-svelte';
	export let open = false;
</script>

<Modal bind:open size="md">
	<div class="font-sans">
		<div class="mb-4 flex items-center gap-4">
			<h1 class="m-0 text-2xl">🛼 Roller Derby Strategy Board</h1>
			<Badge large color="primary">{version} | {buildDate}</Badge>
		</div>
		<p class="mb-4">
			An interactive web application for real-time recording of roller derby strategies through your
			browser.
		</p>

		<p class="mb-4">
			More information about the project and code can be found on
			<A href="https://github.com/ruihildt/roller-derby-strategy" target="_blank">Github</A>. The
			whole project is licensed under (
			<A href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank">AGPLv3</A>).
		</p>

		<Hr class="my-6" />

		<p>
			For feedback or suggestions, please
			<A href="https://github.com/ruihildt/roller-derby-strategy/issues" target="_blank"
				>open an issue</A
			>
			or
			<A href="mailto:ruihildt@protonmail.com">email me</A>.
		</p>
	</div>
</Modal>
