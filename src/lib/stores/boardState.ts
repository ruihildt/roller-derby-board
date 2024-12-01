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

interface ViewSettings {
	zoom: number;
	panX: number;
	panY: number;
}

export interface BoardState {
	version: number;
	createdAt: string;
	name?: string;
	teamPlayers: TeamPlayerPosition[];
	skatingOfficials: SkatingOfficialPosition[];
	viewSettings?: ViewSettings;
}

export const boardState = persisted<BoardState>('derbyboard-state', {
	version: 1,
	createdAt: new Date().toISOString(),
	teamPlayers: [],
	skatingOfficials: [],
	viewSettings: {
		zoom: 1,
		panX: 0,
		panY: 0
	}
});
