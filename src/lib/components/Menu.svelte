<script lang="ts">
	import type { Game } from '$lib/classes/Game';
	import { exportPlayersToFile, loadPlayersFromFile } from '$lib/utils/positions';

	import { Dropdown, DropdownItem, Button, DropdownDivider } from 'flowbite-svelte';
	import {
		BarsOutline,
		ArrowDownToBracketOutline,
		FolderOpenOutline,
		RefreshOutline,
		ImageOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';

	let { game } = $props<{
		game: Game;
	}>();

	function handleReset() {
		game.playerManager.resetPlayers();
	}

	function handleOpen() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.click();

		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				game.playerManager.removeAllTeamPlayers();
				await loadPlayersFromFile(game, file);
			}
		};
	}

	function handleSave() {
		exportPlayersToFile(game);
	}
</script>

<div class="absolute left-4 top-4 z-50">
	<Button class="bg-white !p-2 hover:bg-primary-200">
		<BarsOutline class="h-6 w-6" color="gray" />
	</Button>
	<Dropdown class="w-40">
		<DropdownItem class="flex items-center hover:bg-primary-200" on:click={handleOpen}>
			<FolderOpenOutline class="mr-2 h-4 w-4" />
			<span>Open</span>
		</DropdownItem>
		<DropdownItem class="flex items-center hover:bg-primary-200" on:click={handleSave}>
			<ArrowDownToBracketOutline class="mr-2 h-4 w-4" />
			<span>Save to disk</span>
		</DropdownItem>
		<DropdownItem class="flex items-center hover:bg-primary-200">
			<ImageOutline class="mr-2 h-4 w-4" />
			<span>Export image</span>
		</DropdownItem>
		<DropdownDivider />
		<DropdownItem class="flex items-center hover:bg-primary-200" on:click={handleReset}>
			<RefreshOutline class="mr-2 h-4 w-4" />
			<span>Reset board</span>
		</DropdownItem>

		<DropdownDivider />
		<DropdownItem class="flex items-center hover:bg-primary-200">
			<InfoCircleOutline class="mr-2 h-4 w-4" />
			<span>About</span>
		</DropdownItem>
	</Dropdown>
</div>
