import type { SkatingOfficialRole } from '$lib/classes/SkatingOfficial';
import type { TeamPlayerRole } from '$lib/classes/TeamPlayer';
import type { TeamPlayerTeam } from '$lib/konva/KonvaTeamPlayer';
import { persisted } from 'svelte-persisted-store';

export interface TeamPlayerPosition {
	absolute: {
		x: number;
		y: number;
	};
	role: TeamPlayerRole;
	team: TeamPlayerTeam;
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
	x: number;
	y: number;
}

export interface KonvaBoardState {
	version: number;
	createdAt: string;
	name?: string;
	teamPlayers: TeamPlayerPosition[];
	skatingOfficials: SkatingOfficialPosition[];
	viewSettings?: ViewSettings;
}

export const boardState = persisted<KonvaBoardState>('derbyboard-save', {
	version: 3,
	createdAt: new Date().toISOString(),
	teamPlayers: [],
	skatingOfficials: [],
	viewSettings: {
		zoom: 1,
		x: 0,
		y: 0
	}
});
