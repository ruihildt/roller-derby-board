import type { Game } from '$lib/classes/Game';
import { type TeamPlayerPosition } from '$lib/classes/TeamPlayer';

export function exportPlayersToFile(game: Game) {
	const positions = game.exportTeamPlayers();
	const blob = new Blob([positions], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = 'positions.json';
	link.click();

	URL.revokeObjectURL(url);
}

export async function loadPlayersFromFile(game: Game, jsonFile: File) {
	const text = await jsonFile.text();
	const teamPlayers: TeamPlayerPosition[] = JSON.parse(text);

	teamPlayers.forEach((teamPlayer) => {
		const position = game.scalingManager.scalePosition(
			teamPlayer.absolute.x,
			teamPlayer.absolute.y
		);
		game.playerManager.addTeamPlayer(position.x, position.y, teamPlayer.team, teamPlayer.role);
	});
}
