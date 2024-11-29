<script lang="ts">
	import type { Game } from '$lib/classes/Game';
	import { exportBoardToFile, loadBoardFromFile } from '$lib/utils/boardState';

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

	let dropdownOpen = $state(false);

	function toggleMenu() {
		dropdownOpen = !dropdownOpen;
	}

	function handleReset() {
		game.playerManager.resetPlayers();
		dropdownOpen = false;
	}

	function handleOpen() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.click();
		dropdownOpen = false;

		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				await loadBoardFromFile(game, file);
			}
		};
	}

	function handleExportImage() {
		const link = document.createElement('a');
		link.download = `derbyboard-${new Date().toISOString().slice(0, 10)}.png`;
		link.href = game.renderer.highResCanvas.toDataURL('image/png');
		link.click();
		dropdownOpen = false;
	}

	function handleSave() {
		exportBoardToFile(game);
		dropdownOpen = false;
	}
</script>

<div class="absolute left-4 top-4 z-50">
	<Button class="bg-white !p-2 hover:bg-primary-200" onclick={() => toggleMenu}>
		<BarsOutline class="h-6 w-6" color="gray" />
	</Button>

	<Dropdown bind:open={dropdownOpen} class="w-40">
		<DropdownItem class="flex items-center text-gray-600 hover:bg-primary-200" onclick={handleOpen}>
			<FolderOpenOutline class="mr-2 h-4 w-4" />
			<span>Open</span>
		</DropdownItem>
		<DropdownItem class="flex items-center text-gray-700 hover:bg-primary-200" onclick={handleSave}>
			<ArrowDownToBracketOutline class="mr-2 h-4 w-4" />
			<span>Save to...</span>
		</DropdownItem>
		<DropdownItem
			class="flex items-center text-gray-700 hover:bg-primary-200"
			onclick={handleExportImage}
		>
			<ImageOutline class="mr-2 h-4 w-4" />
			<span>Export image...</span>
		</DropdownItem>

		<DropdownDivider />
		<DropdownItem
			class="flex items-center text-gray-700 hover:bg-primary-200"
			onclick={handleReset}
		>
			<RefreshOutline class="mr-2 h-4 w-4" />
			<span>Reset board</span>
		</DropdownItem>
		<DropdownDivider />
		<DropdownItem
			class="flex items-center text-gray-700 hover:bg-primary-200"
			href="https://github.com/ruihildt/derbyboard"
			target="_blank"
			onclick={() => (dropdownOpen = false)}
		>
			<InfoCircleOutline class="mr-2 h-4 w-4" />
			<span>About</span>
		</DropdownItem>
	</Dropdown>
</div>
