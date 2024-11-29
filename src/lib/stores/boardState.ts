import type { SkatingOfficial } from '$lib/classes/SkatingOfficial';
import type { TeamPlayer } from '$lib/classes/TeamPlayer';
import type { Point } from '$lib/types';
import { persisted } from 'svelte-persisted-store';

export interface BoardState {
	players: TeamPlayer[];
	skatingOfficials: SkatingOfficial[];
	lastUpdate: number;
	positions: Record<string, Point>;
}

const initialState: BoardState = {
	players: [],
	skatingOfficials: [],
	lastUpdate: Date.now(),
	positions: {}
};

export const persistedBoardState = persisted('derbyboard-state', initialState);

let previousPositions: string = '';

export function updateBoardState(
	players: TeamPlayer[],
	skatingOfficials: SkatingOfficial[],
	positions: Record<string, Point>
) {
	const currentPositions = JSON.stringify([
		...players.map((p) => ({ x: p.x, y: p.y })),
		...skatingOfficials.map((o) => ({ x: o.x, y: o.y }))
	]);

	if (currentPositions !== previousPositions) {
		persistedBoardState.set({
			players,
			skatingOfficials,
			positions,
			lastUpdate: Date.now()
		});
		previousPositions = currentPositions;
	}
}
