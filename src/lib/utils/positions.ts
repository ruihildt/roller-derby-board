import type { Game } from '$lib/classes/Game';
import { type TeamPlayerPosition } from '$lib/classes/TeamPlayer';

export function savePositionsJSON(game: Game) {
	const positions = game.exportPositions();
	const blob = new Blob([positions], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = 'positions.json';
	link.click();

	URL.revokeObjectURL(url);
}

export async function loadPositionsJSON(game: Game, jsonFile: File) {
	const text = await jsonFile.text();
	const positions: TeamPlayerPosition[] = JSON.parse(text);

	positions.forEach((player) => {
		const scaledPos = game.scalingManager.scalePosition(player.position.x, player.position.y);
		game.playerManager.addTeamPlayer(scaledPos.x, scaledPos.y, player.team, player.role);
	});
}
