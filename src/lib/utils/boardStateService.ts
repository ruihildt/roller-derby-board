import type { Game } from '$lib/classes/Game';
import { boardState, type BoardState } from '$lib/stores/boardState';

export function saveBoardState(game: Game, name?: string): BoardState {
	const state: BoardState = {
		version: 2,
		createdAt: new Date().toISOString(),
		name,
		teamPlayers: game.playerManager.players.map((player) => ({
			absolute: {
				x: player.x / game.canvas.width,
				y: player.y / game.canvas.height
			},
			role: player.role,
			team: player.team
		})),
		skatingOfficials: game.playerManager.skatingOfficials.map((official) => ({
			absolute: {
				x: official.x / game.canvas.width,
				y: official.y / game.canvas.height
			},
			role: official.role
		})),
		viewSettings: {
			zoom: game.scalingManager.zoomLevel,
			panX: game.scalingManager.panX,
			panY: game.scalingManager.panY
		}
	};

	boardState.set(state);
	return state;
}

export function exportBoardToFile(game: Game, name?: string) {
	const state = saveBoardState(game, name);
	const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `derbyboard-${name || new Date().toISOString().slice(0, 10)}.json`;
	link.click();
	URL.revokeObjectURL(url);
}

export async function loadBoardFromFile(jsonFile: File) {
	const text = await jsonFile.text();
	const state = JSON.parse(text);
	if (!hasRequiredBoardStateFields(state)) {
		throw new Error('Invalid derbyboard file format');
	}
	boardState.set(state);
}

function hasRequiredBoardStateFields(obj: unknown): obj is BoardState {
	const board = obj as BoardState;
	return (
		board !== null &&
		typeof board.version === 'number' &&
		typeof board.createdAt === 'string' &&
		Array.isArray(board.teamPlayers) &&
		Array.isArray(board.skatingOfficials)
	);
}
