import type { SkatingOfficialRole } from '$lib/classes/SkatingOfficial';
import type { TeamPlayerRole } from '$lib/classes/TeamPlayer';
import { persisted } from 'svelte-persisted-store';

export interface TeamPlayerPosition {
	absolute: {
		x: number;
		y: number;
	};
	role: TeamPlayerRole;
	team: string;
}

export interface SkatingOfficialPosition {
	absolute: {
		x: number;
		y: number;
	};
	role: SkatingOfficialRole;
}

export interface BoardState {
	version: number;
	createdAt: string;
	name?: string;
	teamPlayers: TeamPlayerPosition[];
	skatingOfficials: SkatingOfficialPosition[];
}

export const boardState = persisted<BoardState>('derbyboard-state', {
	version: 1,
	createdAt: new Date().toISOString(),
	teamPlayers: [],
	skatingOfficials: []
});
