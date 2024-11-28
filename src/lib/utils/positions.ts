import type { Game } from '$lib/classes/Game';
import { SkatingOfficial, type SkatingOfficialPosition } from '$lib/classes/SkatingOfficial';
import { type TeamPlayerPosition } from '$lib/classes/TeamPlayer';

type boardState = {
	teamPlayers: TeamPlayerPosition[];
	skatingOfficials: SkatingOfficialPosition[];
};

export function exportBoardToFile(game: Game) {
	const positions: boardState = {
		teamPlayers: game.playerManager.players.map((player) => {
			return {
				absolute: {
					x: player.x / game.canvas.width, // Store as percentage of track width
					y: player.y / game.canvas.height // Store as percentage of track height
				},
				role: player.role,
				team: player.team
			} as TeamPlayerPosition;
		}),
		skatingOfficials: game.playerManager.skatingOfficials.map((official) => ({
			absolute: {
				x: official.x / game.canvas.width,
				y: official.y / game.canvas.height
			},
			role: official.role
		}))
	};

	const blob = new Blob([JSON.stringify(positions)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `derby-board-situation-${new Date().toISOString().slice(0, 10)}.json`;
	link.click();

	URL.revokeObjectURL(url);
}

export async function loadBoardFromFile(game: Game, jsonFile: File) {
	const text = await jsonFile.text();
	const positions: boardState = JSON.parse(text);

	// Clear existing players and officials
	game.playerManager.players = [];
	game.playerManager.skatingOfficials = [];

	// Load team players
	positions.teamPlayers.forEach((teamPlayer) => {
		const position = game.scalingManager.scalePosition(
			teamPlayer.absolute.x,
			teamPlayer.absolute.y
		);
		game.playerManager.addTeamPlayer(position.x, position.y, teamPlayer.team, teamPlayer.role);
	});

	// Load skating officials
	positions.skatingOfficials.forEach((official) => {
		const position = game.scalingManager.scalePosition(official.absolute.x, official.absolute.y);
		game.playerManager.skatingOfficials.push(
			new SkatingOfficial(position.x, position.y, official.role)
		);
	});
}
