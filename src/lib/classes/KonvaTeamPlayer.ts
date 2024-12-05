import type Konva from 'konva';
import { colors } from '$lib/constants';

import { KonvaPlayer } from './KonvaPlayer';
export enum TeamPlayerRole {
	jammer = 'jammer',
	blocker = 'blocker',
	pivot = 'pivot'
}

export enum TeamPlayerTeam {
	A = 'A',
	B = 'B'
}

export type TeamPlayerPosition = {
	absolute: { x: number; y: number };
	role: TeamPlayerRole;
	team: TeamPlayerTeam;
};

export class KonvaTeamPlayer extends KonvaPlayer {
	team: TeamPlayerTeam;
	role: TeamPlayerRole;
	zone: number;
	inBounds: boolean;
	isInEngagementZone: boolean;
	isInPack: boolean;
	isRearmost: boolean;
	isForemost: boolean;

	constructor(
		x: number,
		y: number,
		layer: Konva.Layer,
		team: TeamPlayerTeam,
		role: TeamPlayerRole
	) {
		super(x, y, layer);
		this.team = team;
		this.role = role;

		this.zone = 0;
		this.inBounds = false;
		this.isInPack = false;
		this.isRearmost = false;
		this.isForemost = false;
		this.isInEngagementZone = false;

		// Set fill and stroke colors based on team
		this.circle.fill(team === 'A' ? colors.teamAPrimary : colors.teamBPrimary);
		this.circle.stroke(team === 'A' ? colors.teamASecondary : colors.teamBSecondary);
	}
}
