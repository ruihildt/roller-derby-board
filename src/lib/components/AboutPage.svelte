<script lang="ts">
	import { buildDate, version } from '../utils/appVersion';
	import { Modal, Badge, Hr, A, Button } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	let open = false;
</script>

<Modal bind:open size="lg">
	<div class="font-sans">
		<div class="flex items-center gap-4 mb-4">
			<h1 class="text-2xl m-0">🛼 Roller Derby Strategy Board</h1>
			<Badge color="pink">{version} | {buildDate}</Badge>
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

<Button
	class="absolute bottom-5 right-5 hover:-translate-y-0.5 transition-transform duration-200 !p-2.5 w-10 h-10"
	size="xl"
	pill={true}
	on:click={() => (open = true)}
>
	<InfoCircleSolid class="w-9 h-9" />
</Button>
